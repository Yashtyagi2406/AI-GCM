-- AI-GCM PostgreSQL Schema — Migration 0002
-- Usage Events (partitioned) + Pricing Table

CREATE TABLE usage_events (
    id                  UUID DEFAULT gen_random_uuid(),
    org_id              UUID NOT NULL,
    user_id             UUID NOT NULL,
    team_id             UUID,
    project_id          UUID,
    provider            VARCHAR(50) NOT NULL,
    model               VARCHAR(100) NOT NULL,
    prompt_tokens       INTEGER NOT NULL DEFAULT 0,
    completion_tokens   INTEGER NOT NULL DEFAULT 0,
    total_tokens        INTEGER GENERATED ALWAYS AS (prompt_tokens + completion_tokens) STORED,
    cost_usd            DECIMAL(14, 8) NOT NULL DEFAULT 0,
    latency_ms          INTEGER,
    status              VARCHAR(20) DEFAULT 'success',
    request_id          VARCHAR(100),
    prompt_hash         VARCHAR(64),
    dlp_violation       BOOLEAN DEFAULT FALSE,
    policy_blocked      BOOLEAN DEFAULT FALSE,
    cache_hit           BOOLEAN DEFAULT FALSE,
    is_batch            BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create partitions for current and next months
CREATE TABLE usage_events_y2026m05 PARTITION OF usage_events
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE usage_events_y2026m06 PARTITION OF usage_events
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE usage_events_y2026m07 PARTITION OF usage_events
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

-- Pricing table (updated daily by pricing updater)
CREATE TABLE pricing_table (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider        VARCHAR(50) NOT NULL,
    model           VARCHAR(100) NOT NULL,
    input_per_mtok  DECIMAL(10, 4) NOT NULL,
    output_per_mtok DECIMAL(10, 4) NOT NULL,
    cache_discount  DECIMAL(4, 3) DEFAULT 0,
    batch_discount  DECIMAL(4, 3) DEFAULT 0,
    effective_from  DATE NOT NULL,
    effective_to    DATE,
    UNIQUE (provider, model, effective_from)
);

-- Indexes
CREATE INDEX idx_usage_org_created ON usage_events(org_id, created_at DESC);
CREATE INDEX idx_usage_user_created ON usage_events(user_id, created_at DESC);
CREATE INDEX idx_usage_team_created ON usage_events(team_id, created_at DESC);
CREATE INDEX idx_usage_prompt_hash  ON usage_events(prompt_hash) WHERE prompt_hash IS NOT NULL;
CREATE INDEX idx_usage_request_id   ON usage_events(request_id) WHERE request_id IS NOT NULL;
