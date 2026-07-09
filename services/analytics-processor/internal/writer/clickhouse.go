// Package writer implements a ClickHouse batch writer for usage events.
// Uses the native ClickHouse Go driver for efficient columnar batch inserts.
package writer

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/google/uuid"

	"github.com/ai-gcm/analytics-processor/internal/consumer"
)

// ClickHouseWriter inserts UsageEvent batches into ClickHouse.
type ClickHouseWriter struct {
	conn driver.Conn
}

// New opens a ClickHouse connection and returns a ready writer.
// dsn format: "clickhouse://host:9000?database=default"
func New(dsn string) (*ClickHouseWriter, error) {
	opts, err := clickhouse.ParseDSN(dsn)
	if err != nil {
		return nil, fmt.Errorf("clickhouse DSN parse: %w", err)
	}

	conn, err := clickhouse.Open(opts)
	if err != nil {
		return nil, fmt.Errorf("clickhouse open: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := conn.Ping(ctx); err != nil {
		return nil, fmt.Errorf("clickhouse ping: %w", err)
	}

	log.Println("[ch-writer] ClickHouse connection established")
	return &ClickHouseWriter{conn: conn}, nil
}

// Write implements consumer.EventSink — bulk-inserts a batch of events.
func (w *ClickHouseWriter) Write(ctx context.Context, events []consumer.UsageEvent) error {
	if len(events) == 0 {
		return nil
	}

	batch, err := w.conn.PrepareBatch(ctx,
		`INSERT INTO usage_events_analytics (
			event_date, org_id, user_id, team_id, project_id,
			provider, model,
			prompt_tokens, completion_tokens, total_tokens,
			cost_usd, latency_ms, status,
			dlp_violation, cache_hit, is_batch, created_at
		)`)
	if err != nil {
		return fmt.Errorf("prepare batch: %w", err)
	}

	for _, ev := range events {
		orgID  := parseUUID(ev.OrgID)
		userID := parseUUID(ev.UserID)
		teamID := parseNullableUUID(ev.TeamID)
		projID := parseNullableUUID(ev.ProjectID)

		totalTokens := ev.InputTokens + ev.OutputTokens

		if err := batch.Append(
			ev.Timestamp.UTC(),     // event_date (Date — driver truncates)
			orgID,
			userID,
			teamID,
			projID,
			ev.Provider,
			ev.Model,
			uint32(ev.InputTokens),
			uint32(ev.OutputTokens),
			uint32(totalTokens),
			ev.CostUSD,
			uint32(ev.LatencyMS),
			ev.Status,
			boolToUint8(ev.DLPViolation),
			boolToUint8(ev.CacheHit),
			boolToUint8(ev.IsBatch),
			ev.Timestamp.UTC(),     // created_at DateTime64(3)
		); err != nil {
			log.Printf("[ch-writer] append row: %v", err)
		}
	}

	if err := batch.Send(); err != nil {
		return fmt.Errorf("batch send: %w", err)
	}

	log.Printf("[ch-writer] inserted %d rows into usage_events_analytics", len(events))
	return nil
}

// ── Helpers ───────────────────────────────────────────────────────────────────

func parseUUID(s string) [16]byte {
	if s == "" {
		return [16]byte{}
	}
	id, err := uuid.Parse(s)
	if err != nil {
		return [16]byte{}
	}
	return id
}

func parseNullableUUID(s string) *[16]byte {
	if s == "" {
		return nil
	}
	id, err := uuid.Parse(s)
	if err != nil {
		return nil
	}
	arr := [16]byte(id)
	return &arr
}

func boolToUint8(b bool) uint8 {
	if b {
		return 1
	}
	return 0
}
