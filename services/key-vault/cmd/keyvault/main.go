package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	_ "github.com/lib/pq"

	"github.com/ai-gcm/key-vault/internal/vault"
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("[key-vault] starting")

	port   := getEnv("PORT", "3003")
	dbURL  := getEnv("DATABASE_URL", "postgresql://aigcm:password@localhost:5432/aigcm")

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("[key-vault] db open: %v", err)
	}
	if err := db.Ping(); err != nil {
		log.Fatalf("[key-vault] db ping: %v", err)
	}
	log.Println("[key-vault] postgres connected")

	store := vault.NewStore(db)
	mux   := http.NewServeMux()

	// GET /health
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, 200, map[string]string{"status": "ok", "service": "key-vault"})
	})

	// POST /keys — create
	mux.HandleFunc("/keys", func(w http.ResponseWriter, r *http.Request) {
		orgID := r.Header.Get("X-Org-ID")
		if orgID == "" {
			writeJSON(w, 401, map[string]string{"error": "X-Org-ID header required"})
			return
		}
		switch r.Method {
		case http.MethodGet:
			keys, err := store.List(r.Context(), orgID)
			if err != nil {
				log.Printf("[key-vault] list: %v", err)
				writeJSON(w, 500, map[string]string{"error": "internal error"})
				return
			}
			writeJSON(w, 200, map[string]interface{}{"keys": maskKeys(keys)})

		case http.MethodPost:
			var req struct {
				Provider      string     `json:"provider"`
				Label         string     `json:"label"`
				PlaintextKey  string     `json:"key"`
				AllowedModels []string   `json:"allowed_models"`
				RateLimitRPM  *int       `json:"rate_limit_rpm"`
				RateLimitTPM  *int       `json:"rate_limit_tpm"`
				ExpiresAt     *time.Time `json:"expires_at"`
				CreatedBy     *string    `json:"created_by"`
			}
			if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
				writeJSON(w, 400, map[string]string{"error": "invalid JSON"})
				return
			}
			if req.Provider == "" || req.PlaintextKey == "" {
				writeJSON(w, 400, map[string]string{"error": "provider and key are required"})
				return
			}

			record, err := store.Create(r.Context(), vault.CreateKeyRequest{
				OrgID:         orgID,
				Provider:      req.Provider,
				Label:         req.Label,
				PlaintextKey:  req.PlaintextKey,
				AllowedModels: req.AllowedModels,
				RateLimitRPM:  req.RateLimitRPM,
				RateLimitTPM:  req.RateLimitTPM,
				ExpiresAt:     req.ExpiresAt,
				CreatedBy:     req.CreatedBy,
			})
			if err != nil {
				log.Printf("[key-vault] create: %v", err)
				writeJSON(w, 500, map[string]string{"error": "internal error"})
				return
			}
			writeJSON(w, 201, maskKey(record))

		default:
			writeJSON(w, 405, map[string]string{"error": "method not allowed"})
		}
	})

	// /keys/{id} — get + delete
	mux.HandleFunc("/keys/", func(w http.ResponseWriter, r *http.Request) {
		orgID := r.Header.Get("X-Org-ID")
		if orgID == "" {
			writeJSON(w, 401, map[string]string{"error": "X-Org-ID header required"})
			return
		}

		path  := strings.TrimPrefix(r.URL.Path, "/keys/")
		parts := strings.Split(path, "/")
		id    := parts[0]
		if id == "" {
			writeJSON(w, 400, map[string]string{"error": "key ID required"})
			return
		}

		// POST /keys/{id}/rotate
		if len(parts) == 2 && parts[1] == "rotate" && r.Method == http.MethodPost {
			var req struct {
				NewKey    string  `json:"new_key"`
				Reason    string  `json:"reason"`
				RotatedBy *string `json:"rotated_by"`
			}
			if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.NewKey == "" {
				writeJSON(w, 400, map[string]string{"error": "new_key is required"})
				return
			}
			reason := req.Reason
			if reason == "" {
				reason = "manual"
			}
			if err := store.Rotate(r.Context(), id, orgID, req.NewKey, reason, req.RotatedBy); err != nil {
				log.Printf("[key-vault] rotate: %v", err)
				writeJSON(w, 500, map[string]string{"error": "internal error"})
				return
			}
			writeJSON(w, 200, map[string]string{"status": "rotated"})
			return
		}

		switch r.Method {
		case http.MethodGet:
			rec, err := store.GetByID(r.Context(), id, orgID)
			if err != nil || rec == nil {
				writeJSON(w, 404, map[string]string{"error": "key not found"})
				return
			}
			writeJSON(w, 200, maskKey(rec))

		case http.MethodDelete:
			if err := store.Deactivate(r.Context(), id, orgID); err != nil {
				log.Printf("[key-vault] deactivate: %v", err)
				writeJSON(w, 500, map[string]string{"error": "internal error"})
				return
			}
			w.WriteHeader(204)

		default:
			writeJSON(w, 405, map[string]string{"error": "method not allowed"})
		}
	})

	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      mux,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	}
	log.Printf("[key-vault] listening on :%s", port)
	if err := srv.ListenAndServe(); err != nil {
		log.Fatalf("[key-vault] server: %v", err)
	}
}

// maskKey returns a key record with the first 8 chars shown and the rest masked.
func maskKey(k *vault.KeyRecord) map[string]interface{} {
	maskedHash := ""
	if len(k.KeyHash) > 8 {
		maskedHash = k.KeyHash[:8] + "••••••••••••••••"
	}
	return map[string]interface{}{
		"id":           k.ID,
		"org_id":       k.OrgID,
		"provider":     k.Provider,
		"label":        k.Label,
		"key_preview":  maskedHash,
		"is_active":    k.IsActive,
		"last_used_at": k.LastUsedAt,
		"expires_at":   k.ExpiresAt,
		"created_at":   k.CreatedAt,
	}
}

func maskKeys(keys []*vault.KeyRecord) []map[string]interface{} {
	result := make([]map[string]interface{}, 0, len(keys))
	for _, k := range keys {
		result = append(result, maskKey(k))
	}
	return result
}

func writeJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
