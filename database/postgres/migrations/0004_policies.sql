-- AI-GCM PostgreSQL Schema — Migration 0004
-- Governance Policies

CREATE TYPE policy_type AS ENUM (
    'model_allowlist', 'dlp', 'rate_limit', 'budget_enforcement',
    'approval_workflow', 'content_filter', 'time_restriction', 'compliance_mode'
);

CREATE TABLE policies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    type            policy_type NOT NULL,
    scope_type      scope_type,
    scope_id        UUID,
    rules           JSONB NOT NULL DEFAULT '{}',
    priority        INTEGER DEFAULT 100,
    is_active       BOOLEAN DEFAULT TRUE,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE policy_versions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id       UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    version         INTEGER NOT NULL,
    rules           JSONB NOT NULL,
    changed_by      UUID REFERENCES users(id),
    change_reason   TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE approval_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL,
    policy_id       UUID REFERENCES policies(id),
    requester_id    UUID REFERENCES users(id),
    approver_id     UUID REFERENCES users(id),
    request_meta    JSONB NOT NULL,     -- model, tokens, cost estimate, context
    status          VARCHAR(20) DEFAULT 'pending',
    decided_at      TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_policies_org_active   ON policies(org_id, is_active, priority);
CREATE INDEX idx_policies_scope        ON policies(scope_type, scope_id);
CREATE INDEX idx_approvals_status      ON approval_requests(org_id, status, expires_at);
