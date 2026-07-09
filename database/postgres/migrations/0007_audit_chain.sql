-- AI-GCM PostgreSQL Schema — Migration 0007
-- Tamper-evident audit log chain (Phase 2)
--
-- Each row stores a SHA-256 hash of its own content XOR'd with the
-- previous row's hash, creating an append-only verifiable chain.

CREATE TABLE audit_log_chain (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    seq_num         BIGINT NOT NULL,           -- monotonic per org
    event_type      VARCHAR(50) NOT NULL,      -- 'api_request' | 'policy_change' | 'key_rotation' | ...
    actor_id        UUID REFERENCES users(id), -- who triggered the event (null = system)
    actor_ip        INET,
    resource_type   VARCHAR(100),              -- 'proxy_request' | 'budget' | 'api_key' | ...
    resource_id     VARCHAR(255),              -- request_id, budget_id, key_id, etc.
    payload         JSONB NOT NULL DEFAULT '{}', -- full event details
    prev_hash       VARCHAR(64) NOT NULL,      -- SHA-256 of previous row (empty string for first row)
    entry_hash      VARCHAR(64) NOT NULL,      -- SHA-256(seq_num || org_id || event_type || payload || prev_hash)
    hmac_sig        VARCHAR(64) NOT NULL,      -- HMAC-SHA256(entry_hash, signing_key) for additional tamper evidence
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (org_id, seq_num)
);

-- Sequence counter table (one row per org, incremented atomically)
CREATE TABLE audit_seq (
    org_id      UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
    next_seq    BIGINT NOT NULL DEFAULT 1
);

-- Indexes for the verify endpoint and dashboard queries
CREATE INDEX idx_audit_chain_org_seq   ON audit_log_chain(org_id, seq_num);
CREATE INDEX idx_audit_chain_org_time  ON audit_log_chain(org_id, created_at DESC);
CREATE INDEX idx_audit_chain_actor     ON audit_log_chain(actor_id, created_at DESC);
CREATE INDEX idx_audit_chain_resource  ON audit_log_chain(resource_type, resource_id);
