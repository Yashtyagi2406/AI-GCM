-- AI-GCM PostgreSQL Schema — Migration 0009
-- Add monthly usage_events partitions for Aug–Dec 2026 + Q1 2027
-- Run this before August 2026 or via automation.

CREATE TABLE IF NOT EXISTS usage_events_y2026m08 PARTITION OF usage_events
    FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');

CREATE TABLE IF NOT EXISTS usage_events_y2026m09 PARTITION OF usage_events
    FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');

CREATE TABLE IF NOT EXISTS usage_events_y2026m10 PARTITION OF usage_events
    FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');

CREATE TABLE IF NOT EXISTS usage_events_y2026m11 PARTITION OF usage_events
    FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');

CREATE TABLE IF NOT EXISTS usage_events_y2026m12 PARTITION OF usage_events
    FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

CREATE TABLE IF NOT EXISTS usage_events_y2027m01 PARTITION OF usage_events
    FOR VALUES FROM ('2027-01-01') TO ('2027-02-01');

CREATE TABLE IF NOT EXISTS usage_events_y2027m02 PARTITION OF usage_events
    FOR VALUES FROM ('2027-02-01') TO ('2027-03-01');

CREATE TABLE IF NOT EXISTS usage_events_y2027m03 PARTITION OF usage_events
    FOR VALUES FROM ('2027-03-01') TO ('2027-04-01');

-- NOTE: Add a recurring job (pg_cron or Lambda) to create partitions automatically
-- 2 months in advance to avoid partition misses:
--
-- SELECT cron.schedule('create-partitions', '0 0 1 * *',
--   $$SELECT create_next_usage_partition()$$);
