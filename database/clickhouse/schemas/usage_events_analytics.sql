-- ClickHouse schema for usage event analytics
-- Optimised for aggregation queries (cost by team/day/model)

CREATE TABLE IF NOT EXISTS usage_events_analytics (
    event_date          Date,
    org_id              UUID,
    user_id             UUID,
    team_id             Nullable(UUID),
    project_id          Nullable(UUID),
    provider            LowCardinality(String),
    model               LowCardinality(String),
    prompt_tokens       UInt32,
    completion_tokens   UInt32,
    total_tokens        UInt32,
    cost_usd            Decimal(14, 8),
    latency_ms          UInt32,
    status              LowCardinality(String),
    dlp_violation       UInt8,
    cache_hit           UInt8,
    is_batch            UInt8,
    created_at          DateTime64(3)
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(event_date)
ORDER BY (org_id, event_date, team_id, provider, model)
TTL event_date + INTERVAL 2 YEAR DELETE
SETTINGS index_granularity = 8192;

-- Pre-aggregated daily summary for instant dashboard queries
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_cost_summary
ENGINE = SummingMergeTree()
ORDER BY (org_id, event_date, team_id, provider, model)
AS SELECT
    toDate(created_at)                  AS event_date,
    org_id, team_id, provider, model,
    sum(prompt_tokens)                  AS total_prompt_tokens,
    sum(completion_tokens)              AS total_completion_tokens,
    sum(cost_usd)                       AS total_cost_usd,
    count()                             AS request_count,
    avg(latency_ms)                     AS avg_latency_ms,
    countIf(dlp_violation = 1)          AS dlp_violations,
    countIf(cache_hit = 1)              AS cache_hits
FROM usage_events_analytics
GROUP BY event_date, org_id, team_id, provider, model;
