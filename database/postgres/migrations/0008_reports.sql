-- AI-GCM PostgreSQL Schema — Migration 0008
-- Generated Reports table (Phase 2 Report Service)

CREATE TYPE report_format AS ENUM ('pdf', 'csv', 'json');
CREATE TYPE report_status AS ENUM ('pending', 'generating', 'ready', 'failed');

CREATE TABLE generated_reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    requested_by    UUID REFERENCES users(id),
    report_type     VARCHAR(100) NOT NULL,   -- 'monthly_cost' | 'usage_breakdown' | 'team_allocation'
    format          report_format NOT NULL DEFAULT 'pdf',
    status          report_status NOT NULL DEFAULT 'pending',
    period_start    DATE NOT NULL,
    period_end      DATE NOT NULL,
    file_path       VARCHAR(1000),           -- local path or S3 key
    file_size_bytes BIGINT,
    row_count       INTEGER,                 -- for CSV exports
    error_message   TEXT,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ
);

CREATE INDEX idx_reports_org_created  ON generated_reports(org_id, created_at DESC);
CREATE INDEX idx_reports_org_status   ON generated_reports(org_id, status);
CREATE INDEX idx_reports_requested_by ON generated_reports(requested_by, created_at DESC);
