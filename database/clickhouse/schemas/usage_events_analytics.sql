-- ClickHouse schema for usage event analytics (Phase 1 + Phase 2)
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
SETTINGS index_granularity = 8192, allow_nullable_key = 1;

-- Pre-aggregated daily summary for instant dashboard queries
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_cost_summary
ENGINE = SummingMergeTree()
ORDER BY (org_id, event_date, team_id, provider, model)
SETTINGS allow_nullable_key = 1
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

-- Hourly aggregation for ML anomaly detection training (Phase 2)
-- Consumed by ml-service every 6h to retrain OrgAnomalyDetector
CREATE TABLE IF NOT EXISTS usage_hourly_agg (
    event_hour          DateTime,
    org_id              UUID,
    team_id             Nullable(UUID),
    hour_of_day         UInt8,
    day_of_week         UInt8,
    request_count       UInt32,
    total_tokens        UInt64,
    total_cost_usd      Decimal(14, 8),
    unique_models       UInt16,
    dlp_violation_count UInt32,
    cache_hit_count     UInt32,
    avg_latency_ms      Float64
)
ENGINE = ReplacingMergeTree()
PARTITION BY toYYYYMM(event_hour)
ORDER BY (org_id, event_hour, team_id)
TTL event_hour + INTERVAL 1 YEAR DELETE
SETTINGS allow_nullable_key = 1;

-- Materialized view that auto-populates usage_hourly_agg
CREATE MATERIALIZED VIEW IF NOT EXISTS hourly_agg_mv
TO usage_hourly_agg
AS SELECT
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
GROUP BY event_hour, org_id, team_id, hour_of_day, day_of_week;

-- Model performance view (Phase 2 — report service)
CREATE MATERIALIZED VIEW IF NOT EXISTS model_performance_summary
ENGINE = SummingMergeTree()
ORDER BY (org_id, event_date, provider, model)
AS SELECT
    toDate(created_at)                  AS event_date,
    org_id,
    provider,
    model,
    count()                             AS request_count,
    sum(cost_usd)                       AS total_cost_usd,
    avg(latency_ms)                     AS avg_latency_ms,
    countIf(cache_hit = 1) / count()    AS cache_hit_rate,
    countIf(status = 'error') / count() AS error_rate
FROM usage_events_analytics
GROUP BY event_date, org_id, provider, model;

