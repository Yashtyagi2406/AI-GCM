// Package aggregator periodically materialises hourly roll-up rows
// into usage_hourly_agg so the ML service always has fresh training data.
//
// The ClickHouse materialized view (hourly_agg_mv) handles real-time inserts;
// this aggregator backfills any gaps on startup and runs an hourly OPTIMIZE.
package aggregator

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

// HourlyAggregator runs a periodic OPTIMIZE on usage_hourly_agg to ensure
// the ReplacingMergeTree deduplication is applied promptly.
type HourlyAggregator struct {
	conn     driver.Conn
	interval time.Duration
}

// New creates an HourlyAggregator.
// interval is typically 1 hour in production, 5 minutes in dev.
func New(conn driver.Conn, interval time.Duration) *HourlyAggregator {
	return &HourlyAggregator{conn: conn, interval: interval}
}

// Run blocks and runs the aggregation loop until ctx is cancelled.
func (a *HourlyAggregator) Run(ctx context.Context) {
	log.Printf("[aggregator] starting hourly roll-up loop (interval=%s)", a.interval)

	// Run once immediately on startup to catch up with any missed events
	if err := a.optimize(ctx); err != nil {
		log.Printf("[aggregator] startup optimize: %v", err)
	}

	ticker := time.NewTicker(a.interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Println("[aggregator] stopping")
			return
		case <-ticker.C:
			if err := a.optimize(ctx); err != nil {
				log.Printf("[aggregator] optimize: %v", err)
			}
		}
	}
}

// optimize triggers a FINAL merge pass on usage_hourly_agg.
func (a *HourlyAggregator) optimize(ctx context.Context) error {
	tCtx, cancel := context.WithTimeout(ctx, 2*time.Minute)
	defer cancel()

	if err := a.conn.Exec(tCtx, "OPTIMIZE TABLE usage_hourly_agg FINAL"); err != nil {
		return fmt.Errorf("OPTIMIZE usage_hourly_agg: %w", err)
	}
	log.Println("[aggregator] OPTIMIZE usage_hourly_agg completed")
	return nil
}

// BackfillLastNHours inserts aggregated rows for the past N hours from
// usage_events_analytics in case the materialized view was not running.
func (a *HourlyAggregator) BackfillLastNHours(ctx context.Context, n int) error {
	query := fmt.Sprintf(`
		INSERT INTO usage_hourly_agg
		SELECT
			toStartOfHour(created_at)           AS event_hour,
			org_id,
			team_id,
			toHour(created_at)                  AS hour_of_day,
			toDayOfWeek(created_at)             AS day_of_week,
			count()                             AS request_count,
			sum(total_tokens)                   AS total_tokens,
			sum(cost_usd)                       AS total_cost_usd,
			uniq(model)                         AS unique_models,
			countIf(dlp_violation = 1)          AS dlp_violation_count,
			countIf(cache_hit = 1)              AS cache_hit_count,
			avg(latency_ms)                     AS avg_latency_ms
		FROM usage_events_analytics
		WHERE created_at >= now() - INTERVAL %d HOUR
		GROUP BY event_hour, org_id, team_id, hour_of_day, day_of_week
	`, n)

	tCtx, cancel := context.WithTimeout(ctx, 5*time.Minute)
	defer cancel()

	if err := a.conn.Exec(tCtx, query); err != nil {
		return fmt.Errorf("backfill last %d hours: %w", n, err)
	}
	log.Printf("[aggregator] backfilled last %d hours into usage_hourly_agg", n)
	return nil
}
