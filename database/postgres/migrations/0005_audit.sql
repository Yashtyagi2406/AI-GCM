-- AI-GCM PostgreSQL Schema — Migration 0005
-- Immutable Hash-Chained Audit Log

CREATE TABLE audit_log (
    id              BIGSERIAL PRIMARY KEY,
    org_id          UUID NOT NULL,
    user_id         UUID,
    action          VARCHAR(100) NOT NULL,
    resource_type   VARCHAR(50),
    resource_id     UUID,
    before_state    JSONB,
    after_state     JSONB,
    ip_address      INET,
    user_agent      TEXT,
    hash            VARCHAR(64) NOT NULL,   -- SHA-256(id|org|action|timestamp|data)
    prev_hash       VARCHAR(64),            -- SHA-256 of previous row (chain)
    created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Audit log is append-only — enforce with RLS
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_insert_only ON audit_log FOR INSERT WITH CHECK (TRUE);
CREATE POLICY audit_select_own  ON audit_log FOR SELECT USING (org_id = current_setting('app.current_org_id')::UUID);

CREATE INDEX idx_audit_org_created ON audit_log(org_id, created_at DESC);
CREATE INDEX idx_audit_user        ON audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_action      ON audit_log(action, created_at DESC);

COMMENT ON TABLE audit_log IS 'Immutable SHA-256 hash-chained audit trail. Never UPDATE or DELETE rows.';
