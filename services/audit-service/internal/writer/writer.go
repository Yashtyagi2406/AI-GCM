// Package writer implements a tamper-evident audit log writer.
//
// Design:
//   - Each audit entry gets a monotonic sequence number per org (from audit_seq).
//   - entry_hash = SHA-256( seqNum || orgID || eventType || payloadJSON || prevHash )
//   - hmac_sig   = HMAC-SHA256( entry_hash, signingKey )
//
// This creates an append-only SHA-256 chain where any tampering
// invalidates all subsequent hashes, detected by the verifier.
package writer

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"time"
)

// AuditEntry is the structured input for a single audit log record.
type AuditEntry struct {
	OrgID        string                 `json:"org_id"`
	EventType    string                 `json:"event_type"`
	ActorID      string                 `json:"actor_id,omitempty"`
	ActorIP      string                 `json:"actor_ip,omitempty"`
	ResourceType string                 `json:"resource_type,omitempty"`
	ResourceID   string                 `json:"resource_id,omitempty"`
	Payload      map[string]interface{} `json:"payload"`
	Timestamp    time.Time              `json:"timestamp"`
}

// Writer appends audit entries to the audit_log_chain table with hash chaining.
type Writer struct {
	db         *sql.DB
	signingKey []byte // HMAC-SHA256 signing key loaded from env
}

// New creates an audit Writer.
// signingKey must be at least 32 bytes (256-bit).
func New(db *sql.DB, signingKey []byte) *Writer {
	return &Writer{db: db, signingKey: signingKey}
}

// Write atomically appends a single AuditEntry to the hash chain.
// It uses a DB transaction to ensure seq_num allocation and insert are atomic.
func (w *Writer) Write(ctx context.Context, entry AuditEntry) error {
	tx, err := w.db.BeginTx(ctx, &sql.TxOptions{Isolation: sql.LevelSerializable})
	if err != nil {
		return fmt.Errorf("audit write: begin tx: %w", err)
	}
	defer tx.Rollback() //nolint:errcheck

	// ── Allocate next sequence number (upsert audit_seq) ─────────────────────
	var seqNum int64
	err = tx.QueryRowContext(ctx, `
		INSERT INTO audit_seq (org_id, next_seq) VALUES ($1, 2)
		ON CONFLICT (org_id) DO UPDATE
		  SET next_seq = audit_seq.next_seq + 1
		RETURNING next_seq - 1
	`, entry.OrgID).Scan(&seqNum)
	if err != nil {
		return fmt.Errorf("audit write: alloc seq: %w", err)
	}

	// ── Fetch previous entry's hash (empty string for first row) ──────────────
	var prevHash string
	err = tx.QueryRowContext(ctx, `
		SELECT COALESCE(entry_hash, '')
		FROM audit_log_chain
		WHERE org_id = $1
		ORDER BY seq_num DESC
		LIMIT 1
		FOR UPDATE
	`, entry.OrgID).Scan(&prevHash)
	if err != nil && err != sql.ErrNoRows {
		return fmt.Errorf("audit write: fetch prev hash: %w", err)
	}

	// ── Build entry_hash ──────────────────────────────────────────────────────
	payloadJSON, err := json.Marshal(entry.Payload)
	if err != nil {
		return fmt.Errorf("audit write: marshal payload: %w", err)
	}

	raw := fmt.Sprintf("%d|%s|%s|%s|%s",
		seqNum, entry.OrgID, entry.EventType, string(payloadJSON), prevHash)
	hashBytes := sha256.Sum256([]byte(raw))
	entryHash := hex.EncodeToString(hashBytes[:])

	// ── Build HMAC signature ─────────────────────────────────────────────────
	mac := hmac.New(sha256.New, w.signingKey)
	mac.Write([]byte(entryHash))
	hmacSig := hex.EncodeToString(mac.Sum(nil))

	// ── Insert audit row ──────────────────────────────────────────────────────
	_, err = tx.ExecContext(ctx, `
		INSERT INTO audit_log_chain
		  (org_id, seq_num, event_type, actor_id, actor_ip, resource_type, resource_id,
		   payload, prev_hash, entry_hash, hmac_sig, created_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
	`,
		entry.OrgID,
		seqNum,
		entry.EventType,
		nullStr(entry.ActorID),
		nullStr(entry.ActorIP),
		nullStr(entry.ResourceType),
		nullStr(entry.ResourceID),
		payloadJSON,
		prevHash,
		entryHash,
		hmacSig,
		entry.Timestamp.UTC(),
	)
	if err != nil {
		return fmt.Errorf("audit write: insert: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("audit write: commit: %w", err)
	}

	log.Printf("[audit-writer] written seq=%d org=%s type=%s hash=%s…",
		seqNum, entry.OrgID, entry.EventType, entryHash[:12])
	return nil
}

// WriteBatch writes a slice of entries in individual transactions.
// Partial success is possible — caller should handle errors per-entry.
func (w *Writer) WriteBatch(ctx context.Context, entries []AuditEntry) []error {
	errs := make([]error, len(entries))
	for i, e := range entries {
		errs[i] = w.Write(ctx, e)
	}
	return errs
}

func nullStr(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}
