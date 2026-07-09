package main

import (
	"context"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/IBM/sarama"
	_ "github.com/lib/pq"

	"github.com/ai-gcm/audit-service/internal/verifier"
	"github.com/ai-gcm/audit-service/internal/writer"
)

const (
	topicUsageEvents = "usage-events"
	consumerGroup    = "audit-service-group"
)

// UsageEvent mirrors the proxy's published event for building audit entries.
type UsageEvent struct {
	RequestID      string    `json:"request_id"`
	OrgID          string    `json:"org_id"`
	UserID         string    `json:"user_id"`
	Provider       string    `json:"provider"`
	Model          string    `json:"model"`
	Status         string    `json:"status"`
	DLPViolation   bool      `json:"dlp_violation"`
	PolicyDecision string    `json:"policy_decision"`
	Timestamp      time.Time `json:"timestamp"`
}

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("[audit-service] starting")

	port         := getEnv("PORT", "3004")
	dbURL        := getEnv("DATABASE_URL", "postgresql://aigcm:password@localhost:5432/aigcm")
	kafkaBrokers := splitCSV(getEnv("KAFKA_BROKERS", ""))
	signingKeyHex := getEnv("AUDIT_SIGNING_KEY", strings.Repeat("00", 32))

	signingKey, err := hex.DecodeString(signingKeyHex)
	if err != nil || len(signingKey) < 32 {
		log.Fatalf("[audit-service] invalid AUDIT_SIGNING_KEY — must be 64 hex chars (32 bytes): %v", err)
	}

	// ── Postgres ──────────────────────────────────────────────────────────────
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("[audit-service] db open: %v", err)
	}
	if err := db.Ping(); err != nil {
		log.Fatalf("[audit-service] db ping: %v", err)
	}
	log.Println("[audit-service] postgres connected")

	auditWriter  := writer.New(db, signingKey)
	auditVerifier := verifier.New(db, signingKey)

	// ── Graceful shutdown ─────────────────────────────────────────────────────
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGTERM, syscall.SIGINT)
	go func() {
		<-quit
		log.Println("[audit-service] shutdown signal received")
		cancel()
	}()

	// ── HTTP server ───────────────────────────────────────────────────────────
	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok","service":"audit-service","version":"2.0.0"}`))
	})

	// GET /audit/verify?org_id=<uuid>[&start=RFC3339][&end=RFC3339]
	mux.HandleFunc("/audit/verify", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		orgID := r.URL.Query().Get("org_id")
		if orgID == "" {
			http.Error(w, `{"error":"org_id required"}`, http.StatusBadRequest)
			return
		}
		start := r.URL.Query().Get("start")
		end   := r.URL.Query().Get("end")

		report, err := auditVerifier.Verify(r.Context(), orgID, start, end)
		if err != nil {
			http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(report)
	})

	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      mux,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	go func() {
		log.Printf("[audit-service] HTTP server listening on :%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("[audit-service] HTTP error: %v", err)
		}
	}()

	// ── Kafka consumer ────────────────────────────────────────────────────────
	if len(kafkaBrokers) == 0 {
		log.Println("[audit-service] WARNING: no KAFKA_BROKERS — HTTP-only mode (dev)")
		<-ctx.Done()
		return
	}

	consCfg := sarama.NewConfig()
	consCfg.Consumer.Group.Rebalance.GroupStrategies = []sarama.BalanceStrategy{sarama.NewBalanceStrategyRoundRobin()}
	consCfg.Consumer.Offsets.Initial = sarama.OffsetNewest
	consCfg.Version = sarama.V3_3_0_0

	group, err := sarama.NewConsumerGroup(kafkaBrokers, consumerGroup, consCfg)
	if err != nil {
		log.Fatalf("[audit-service] consumer group: %v", err)
	}
	defer group.Close()

	handler := &auditHandler{w: auditWriter}
	log.Printf("[audit-service] subscribed to %q", topicUsageEvents)

	for {
		if err := group.Consume(ctx, []string{topicUsageEvents}, handler); err != nil {
			if ctx.Err() != nil {
				break
			}
			log.Printf("[audit-service] consumer error: %v — retrying in 5s", err)
			time.Sleep(5 * time.Second)
		}
	}

	shutCtx, shutCancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer shutCancel()
	_ = srv.Shutdown(shutCtx)
	log.Println("[audit-service] stopped")
}

// ── Kafka handler ─────────────────────────────────────────────────────────────

type auditHandler struct {
	w *writer.Writer
}

func (h *auditHandler) Setup(_ sarama.ConsumerGroupSession) error   { return nil }
func (h *auditHandler) Cleanup(_ sarama.ConsumerGroupSession) error { return nil }

func (h *auditHandler) ConsumeClaim(sess sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
	for msg := range claim.Messages() {
		var ev UsageEvent
		if err := json.Unmarshal(msg.Value, &ev); err != nil {
			log.Printf("[audit-service] unmarshal: %v", err)
			sess.MarkMessage(msg, "")
			continue
		}

		if ev.OrgID == "" {
			sess.MarkMessage(msg, "")
			continue
		}

		entry := writer.AuditEntry{
			OrgID:        ev.OrgID,
			EventType:    "api_request",
			ActorID:      ev.UserID,
			ResourceType: "proxy_request",
			ResourceID:   ev.RequestID,
			Payload: map[string]interface{}{
				"provider":        ev.Provider,
				"model":           ev.Model,
				"status":          ev.Status,
				"dlp_violation":   ev.DLPViolation,
				"policy_decision": ev.PolicyDecision,
			},
			Timestamp: ev.Timestamp,
		}

		if err := h.w.Write(context.Background(), entry); err != nil {
			log.Printf("[audit-service] write error: %v", err)
		}
		sess.MarkMessage(msg, "")
	}
	return nil
}

// ── Helpers ───────────────────────────────────────────────────────────────────

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func splitCSV(s string) []string {
	if s == "" {
		return nil
	}
	parts := strings.Split(s, ",")
	result := make([]string, 0, len(parts))
	for _, p := range parts {
		if t := strings.TrimSpace(p); t != "" {
			result = append(result, t)
		}
	}
	return result
}
