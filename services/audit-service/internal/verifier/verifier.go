// Package verifier walks the audit_log_chain hash chain and reports
// any gaps, missing rows, or tampered hashes.
//
// Algorithm:
//  1. Fetch all rows for the org in seq_num order.
//  2. For each row, recompute SHA-256(seqNum|orgID|eventType|payload|prevHash).
//  3. Compare with stored entry_hash — mismatch = tampered.
//  4. Verify the prev_hash field matches the previous row's entry_hash.
//  5. Re-verify HMAC signature.
//  6. Return a detailed report of any violations found.
package verifier

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"fmt"
	"log"
)

// Violation describes a single integrity failure found during verification.
type Violation struct {
	SeqNum    int64  `json:"seq_num"`
	EntryID   string `json:"entry_id"`
	OrgID     string `json:"org_id"`
	Reason    string `json:"reason"` // "hash_mismatch" | "prev_hash_mismatch" | "hmac_mismatch" | "seq_gap"
	StoredHash   string `json:"stored_hash"`
	ComputedHash string `json:"computed_hash,omitempty"`
}

// VerifyReport is the result returned by the HTTP verify endpoint.
type VerifyReport struct {
	OrgID      string      `json:"org_id"`
	Valid       bool        `json:"valid"`
	Checked     int         `json:"checked"`
	Violations  []Violation `json:"violations"`
	Start       string      `json:"start,omitempty"`
	End         string      `json:"end,omitempty"`
}

// Verifier walks audit chains for an org.
type Verifier struct {
	db         *sql.DB
	signingKey []byte
}

// New creates a Verifier.
func New(db *sql.DB, signingKey []byte) *Verifier {
	return &Verifier{db: db, signingKey: signingKey}
}

type auditRow struct {
	ID           string
	SeqNum       int64
	OrgID        string
	EventType    string
	PayloadJSON  []byte
	PrevHash     string
	EntryHash    string
	HMACsig      string
}

// Verify walks the audit chain for an org between start and end dates (RFC3339).
// Pass empty strings to verify the entire chain.
func (v *Verifier) Verify(ctx context.Context, orgID, start, end string) (*VerifyReport, error) {
	query := `
		SELECT id, seq_num, org_id, event_type, payload::text, prev_hash, entry_hash, hmac_sig
		FROM audit_log_chain
		WHERE org_id = $1
	`
	args := []interface{}{orgID}

	if start != "" {
		query += ` AND created_at >= $2`
		args = append(args, start)
	}
	if end != "" {
		placeholder := fmt.Sprintf("$%d", len(args)+1)
		query += " AND created_at <= " + placeholder
		args = append(args, end)
	}
	query += ` ORDER BY seq_num ASC`

	rows, err := v.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("verify query: %w", err)
	}
	defer rows.Close()

	report := &VerifyReport{
		OrgID:      orgID,
		Valid:      true,
		Violations: []Violation{},
		Start:      start,
		End:        end,
	}

	var prevHash string
	var prevSeq int64 = 0
	checked := 0

	for rows.Next() {
		var row auditRow
		if err := rows.Scan(
			&row.ID, &row.SeqNum, &row.OrgID, &row.EventType,
			&row.PayloadJSON, &row.PrevHash, &row.EntryHash, &row.HMACsig,
		); err != nil {
			return nil, fmt.Errorf("verify scan: %w", err)
		}
		checked++

		// ── Sequence gap check ────────────────────────────────────────────────
		if prevSeq > 0 && row.SeqNum != prevSeq+1 {
			report.Valid = false
			report.Violations = append(report.Violations, Violation{
				SeqNum:  row.SeqNum,
				EntryID: row.ID,
				OrgID:   row.OrgID,
				Reason:  "seq_gap",
				StoredHash: fmt.Sprintf("expected seq %d, got %d", prevSeq+1, row.SeqNum),
			})
		}

		// ── prev_hash linkage check ───────────────────────────────────────────
		if row.PrevHash != prevHash {
			report.Valid = false
			report.Violations = append(report.Violations, Violation{
				SeqNum:       row.SeqNum,
				EntryID:      row.ID,
				OrgID:        row.OrgID,
				Reason:       "prev_hash_mismatch",
				StoredHash:   row.PrevHash,
				ComputedHash: prevHash,
			})
		}

		// ── Recompute entry_hash ──────────────────────────────────────────────
		raw := fmt.Sprintf("%d|%s|%s|%s|%s",
			row.SeqNum, row.OrgID, row.EventType, string(row.PayloadJSON), row.PrevHash)
		h := sha256.Sum256([]byte(raw))
		computed := hex.EncodeToString(h[:])

		if computed != row.EntryHash {
			report.Valid = false
			report.Violations = append(report.Violations, Violation{
				SeqNum:       row.SeqNum,
				EntryID:      row.ID,
				OrgID:        row.OrgID,
				Reason:       "hash_mismatch",
				StoredHash:   row.EntryHash,
				ComputedHash: computed,
			})
		}

		// ── HMAC verification ─────────────────────────────────────────────────
		mac := hmac.New(sha256.New, v.signingKey)
		mac.Write([]byte(row.EntryHash))
		expectedHMAC := hex.EncodeToString(mac.Sum(nil))
		if !hmac.Equal([]byte(expectedHMAC), []byte(row.HMACsig)) {
			report.Valid = false
			report.Violations = append(report.Violations, Violation{
				SeqNum:  row.SeqNum,
				EntryID: row.ID,
				OrgID:   row.OrgID,
				Reason:  "hmac_mismatch",
				StoredHash: row.HMACsig,
			})
		}

		prevHash = row.EntryHash
		prevSeq = row.SeqNum
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("verify rows: %w", err)
	}

	report.Checked = checked
	log.Printf("[verifier] org=%s checked=%d violations=%d", orgID, checked, len(report.Violations))
	return report, nil
}

// VerifyFromDB is a convenience wrapper for the HTTP handler.
func (v *Verifier) VerifyFromDB(ctx context.Context, orgID string) (*VerifyReport, error) {
	return v.Verify(ctx, orgID, "", "")
}
