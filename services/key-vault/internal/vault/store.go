// Package vault provides Postgres-backed storage for encrypted API keys.
package vault

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// KeyRecord represents a stored API key.
type KeyRecord struct {
	ID            string
	OrgID         string
	Provider      string
	Label         string
	KeyHash       string    // SHA-256 of plaintext — used for lookup
	AllowedModels []string
	RateLimitRPM  *int
	RateLimitTPM  *int
	IsActive      bool
	LastUsedAt    *time.Time
	ExpiresAt     *time.Time
	CreatedBy     *string
	CreatedAt     time.Time
}

// CreateKeyRequest holds the inputs to store a new API key.
type CreateKeyRequest struct {
	OrgID         string
	Provider      string
	Label         string
	PlaintextKey  string   // encrypted before storage
	AllowedModels []string
	RateLimitRPM  *int
	RateLimitTPM  *int
	ExpiresAt     *time.Time
	CreatedBy     *string
}

// Store handles Postgres CRUD for API keys.
type Store struct {
	db *sql.DB
}

// NewStore creates a Store backed by the given *sql.DB.
func NewStore(db *sql.DB) *Store {
	return &Store{db: db}
}

// Create encrypts and inserts a new API key.
func (s *Store) Create(ctx context.Context, req CreateKeyRequest) (*KeyRecord, error) {
	encrypted, err := Encrypt(req.PlaintextKey)
	if err != nil {
		return nil, fmt.Errorf("store.Create: encrypt: %w", err)
	}
	hash := Hash(req.PlaintextKey)

	id := uuid.New().String()
	_, err = s.db.ExecContext(ctx, `
		INSERT INTO api_keys
		  (id, org_id, provider, label, key_hash, key_encrypted,
		   allowed_models, rate_limit_rpm, rate_limit_tpm, expires_at, created_by)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
		id, req.OrgID, req.Provider, req.Label, hash, encrypted,
		pqArray(req.AllowedModels), req.RateLimitRPM, req.RateLimitTPM,
		req.ExpiresAt, req.CreatedBy,
	)
	if err != nil {
		return nil, fmt.Errorf("store.Create: insert: %w", err)
	}
	return s.GetByID(ctx, id, req.OrgID)
}

// List returns all active keys for an org (key_encrypted is NOT returned).
func (s *Store) List(ctx context.Context, orgID string) ([]*KeyRecord, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT id, org_id, provider, label, key_hash,
		       is_active, last_used_at, expires_at, created_by, created_at
		FROM api_keys
		WHERE org_id = $1 AND is_active = TRUE
		ORDER BY created_at DESC`,
		orgID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var keys []*KeyRecord
	for rows.Next() {
		k := &KeyRecord{}
		if err := rows.Scan(&k.ID, &k.OrgID, &k.Provider, &k.Label, &k.KeyHash,
			&k.IsActive, &k.LastUsedAt, &k.ExpiresAt, &k.CreatedBy, &k.CreatedAt); err != nil {
			return nil, err
		}
		keys = append(keys, k)
	}
	return keys, rows.Err()
}

// GetByID fetches a single key record (without decrypted plaintext).
func (s *Store) GetByID(ctx context.Context, id, orgID string) (*KeyRecord, error) {
	k := &KeyRecord{}
	err := s.db.QueryRowContext(ctx, `
		SELECT id, org_id, provider, label, key_hash,
		       is_active, last_used_at, expires_at, created_by, created_at
		FROM api_keys WHERE id = $1 AND org_id = $2`,
		id, orgID,
	).Scan(&k.ID, &k.OrgID, &k.Provider, &k.Label, &k.KeyHash,
		&k.IsActive, &k.LastUsedAt, &k.ExpiresAt, &k.CreatedBy, &k.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return k, err
}

// Decrypt fetches and decrypts the plaintext key for a given key ID.
// Only called internally by the proxy during request forwarding.
func (s *Store) Decrypt(ctx context.Context, id, orgID string) (string, error) {
	var encrypted []byte
	err := s.db.QueryRowContext(ctx,
		`SELECT key_encrypted FROM api_keys WHERE id = $1 AND org_id = $2 AND is_active = TRUE`,
		id, orgID,
	).Scan(&encrypted)
	if err == sql.ErrNoRows {
		return "", fmt.Errorf("key not found")
	}
	if err != nil {
		return "", err
	}
	return Decrypt(encrypted)
}

// Rotate encrypts a new plaintext key and updates the stored record.
// The old key is logged in key_rotation_log.
func (s *Store) Rotate(ctx context.Context, id, orgID, newPlaintextKey, reason string, rotatedBy *string) error {
	encrypted, err := Encrypt(newPlaintextKey)
	if err != nil {
		return fmt.Errorf("store.Rotate: encrypt: %w", err)
	}
	hash := Hash(newPlaintextKey)

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.ExecContext(ctx, `
		UPDATE api_keys SET key_encrypted = $1, key_hash = $2, rotate_at = NULL
		WHERE id = $3 AND org_id = $4`,
		encrypted, hash, id, orgID,
	)
	if err != nil {
		return fmt.Errorf("store.Rotate: update: %w", err)
	}

	_, err = tx.ExecContext(ctx, `
		INSERT INTO key_rotation_log (key_id, reason, rotated_by)
		VALUES ($1, $2, $3)`,
		id, reason, rotatedBy,
	)
	if err != nil {
		return fmt.Errorf("store.Rotate: log: %w", err)
	}

	return tx.Commit()
}

// Deactivate soft-deletes a key.
func (s *Store) Deactivate(ctx context.Context, id, orgID string) error {
	_, err := s.db.ExecContext(ctx,
		`UPDATE api_keys SET is_active = FALSE WHERE id = $1 AND org_id = $2`,
		id, orgID,
	)
	return err
}

// pqArray converts a []string to a format pg driver accepts for text[] columns.
func pqArray(ss []string) interface{} {
	if ss == nil {
		return "{}"
	}
	return ss
}
