-- AI-GCM PostgreSQL Schema — Migration 0006
-- Managed API Key Vault

CREATE TABLE api_keys (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    provider        VARCHAR(50) NOT NULL,
    label           VARCHAR(255),
    key_hash        VARCHAR(64) NOT NULL,       -- SHA-256 of plaintext key (for lookup)
    key_encrypted   BYTEA NOT NULL,             -- AES-256-GCM encrypted, KMS DEK
    allowed_models  VARCHAR(100)[] DEFAULT '{}',
    allowed_team_ids UUID[] DEFAULT '{}',
    rate_limit_rpm  INTEGER,
    rate_limit_tpm  INTEGER,
    is_active       BOOLEAN DEFAULT TRUE,
    last_used_at    TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    rotate_at       TIMESTAMPTZ,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE key_rotation_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_id          UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
    reason          VARCHAR(100),           -- 'scheduled' | 'manual' | 'leak_detected'
    rotated_by      UUID REFERENCES users(id),
    rotated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_keys_org      ON api_keys(org_id, provider, is_active);
CREATE INDEX idx_api_keys_hash     ON api_keys(key_hash);
CREATE INDEX idx_key_rotation_key  ON key_rotation_log(key_id, rotated_at DESC);
