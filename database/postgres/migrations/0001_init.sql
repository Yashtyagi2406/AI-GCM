-- AI-GCM PostgreSQL Schema — Migration 0001
-- Organizations, Users, Teams

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

CREATE TYPE plan_type AS ENUM ('free', 'startup', 'growth', 'enterprise');
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'manager', 'team_lead', 'developer', 'analyst', 'finance', 'security');

CREATE TABLE organizations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(100) UNIQUE NOT NULL,
    plan            plan_type NOT NULL DEFAULT 'free',
    billing_email   VARCHAR(255) NOT NULL,
    settings        JSONB DEFAULT '{}',
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE teams (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    department      VARCHAR(255),
    parent_team_id  UUID REFERENCES teams(id),
    cost_center     VARCHAR(100),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    team_id         UUID REFERENCES teams(id),
    email           VARCHAR(255) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    role            user_role NOT NULL DEFAULT 'developer',
    sso_subject     VARCHAR(500),
    avatar_url      VARCHAR(1000),
    is_active       BOOLEAN DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (org_id, email)
);

-- Indexes
CREATE INDEX idx_teams_org_id ON teams(org_id);
CREATE INDEX idx_users_org_id ON users(org_id);
CREATE INDEX idx_users_team_id ON users(team_id);
CREATE INDEX idx_users_email ON users(email);
