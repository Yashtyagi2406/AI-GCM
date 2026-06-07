-- AI-GCM PostgreSQL Schema — Migration 0003
-- Budgets

CREATE TYPE scope_type AS ENUM ('org', 'department', 'team', 'project', 'user');
CREATE TYPE period_type AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'annual', 'custom');

CREATE TABLE budgets (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id              UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name                VARCHAR(255) NOT NULL,
    scope_type          scope_type NOT NULL,
    scope_id            UUID NOT NULL,
    amount_usd          DECIMAL(12, 4) NOT NULL,
    period              period_type NOT NULL DEFAULT 'monthly',
    period_start        DATE,
    period_end          DATE,
    alert_thresholds    INTEGER[] DEFAULT '{50,75,90,100}',
    hard_limit          BOOLEAN DEFAULT FALSE,
    rollover            BOOLEAN DEFAULT FALSE,
    is_active           BOOLEAN DEFAULT TRUE,
    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE budget_spend (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id   UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    period_key  VARCHAR(20) NOT NULL,    -- e.g. "2026-05"
    spent_usd   DECIMAL(12, 8) DEFAULT 0,
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (budget_id, period_key)
);

CREATE INDEX idx_budgets_org      ON budgets(org_id, is_active);
CREATE INDEX idx_budgets_scope    ON budgets(scope_type, scope_id, is_active);
CREATE INDEX idx_budget_spend_key ON budget_spend(budget_id, period_key);
