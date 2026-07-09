/**
 * AI-GCM Report Service — Fastify server
 *
 * Routes:
 *   POST /reports/generate   — request a new report (PDF or CSV)
 *   GET  /reports            — list reports for the org
 *   GET  /reports/:id/download — stream the generated file
 *   GET  /health             — liveness probe
 */
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Pool } from 'pg';
import { createWriteStream, createReadStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';
import { renderPDF, ReportData } from './renderer/pdf';
import { streamCSV } from './renderer/csv';
import { startMonthlyScheduler } from './scheduler/cron';

// ── Config ────────────────────────────────────────────────────────────────────

const PORT       = parseInt(process.env.PORT ?? '3005', 10);
const DB_URL     = process.env.DATABASE_URL ?? 'postgresql://aigcm:password@localhost:5432/aigcm';
const REPORTS_DIR = process.env.REPORTS_DIR ?? '/tmp/ai-gcm-reports';

mkdirSync(REPORTS_DIR, { recursive: true });

// ── DB pool ───────────────────────────────────────────────────────────────────

const pool = new Pool({ connectionString: DB_URL });

// ── Fastify app ───────────────────────────────────────────────────────────────

const app = Fastify({ logger: true });
app.register(cors, { origin: true });

// ── Types ─────────────────────────────────────────────────────────────────────

const GenerateReportSchema = z.object({
  orgId:       z.string().uuid(),
  orgName:     z.string().optional(),
  reportType:  z.enum(['monthly_cost', 'usage_breakdown', 'team_allocation']).default('monthly_cost'),
  format:      z.enum(['pdf', 'csv']).default('pdf'),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodEnd:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  requestedBy: z.string().uuid().nullable().optional(),
  teamId:      z.string().uuid().optional(),
  userId:      z.string().uuid().optional(),
  provider:    z.string().optional(),
});

export type GenerateReportOptions = z.infer<typeof GenerateReportSchema>;

// ── Core report generation logic ──────────────────────────────────────────────

export async function generateReport(opts: GenerateReportOptions): Promise<string> {
  // 1. Insert a "pending" record
  const { rows: [rec] } = await pool.query<{ id: string }>(
    `INSERT INTO generated_reports
       (org_id, requested_by, report_type, format, status, period_start, period_end)
     VALUES ($1,$2,$3,$4,'pending',$5,$6)
     RETURNING id`,
    [opts.orgId, opts.requestedBy ?? null, opts.reportType, opts.format, opts.periodStart, opts.periodEnd],
  );
  const reportId = rec.id;

  // 2. Mark as generating
  await pool.query(`UPDATE generated_reports SET status='generating' WHERE id=$1`, [reportId]);

  const filePath = join(REPORTS_DIR, `${reportId}.${opts.format}`);

  try {
    if (opts.format === 'pdf') {
      await generatePDFReport(opts, filePath);
    } else {
      await generateCSVReport(opts, filePath);
    }

    // 3. Mark as ready
    const { size } = await import('fs/promises').then(fs => fs.stat(filePath));
    await pool.query(
      `UPDATE generated_reports
       SET status='ready', file_path=$1, file_size_bytes=$2, completed_at=NOW()
       WHERE id=$3`,
      [filePath, size, reportId],
    );
  } catch (err) {
    await pool.query(
      `UPDATE generated_reports SET status='failed', error_message=$1 WHERE id=$2`,
      [String(err), reportId],
    );
    throw err;
  }

  return reportId;
}

async function generatePDFReport(opts: GenerateReportOptions, filePath: string): Promise<void> {
  // Fetch cost breakdown from Postgres
  const { rows } = await pool.query<{
    label: string; request_count: string; total_tokens: string; cost_usd: string;
  }>(`
    SELECT
      COALESCE(team_id::text, provider) AS label,
      COUNT(*)::text                    AS request_count,
      SUM(prompt_tokens + completion_tokens)::text AS total_tokens,
      SUM(cost_usd)::text               AS cost_usd
    FROM usage_events
    WHERE org_id = $1
      AND created_at BETWEEN $2 AND $3
    GROUP BY label
    ORDER BY SUM(cost_usd) DESC
    LIMIT 20
  `, [opts.orgId, opts.periodStart + ' 00:00:00', opts.periodEnd + ' 23:59:59']);

  const { rows: [totals] } = await pool.query<{
    total_cost: string; total_requests: string; total_tokens: string; cache_hits: string;
  }>(`
    SELECT
      SUM(cost_usd)::text AS total_cost,
      COUNT(*)::text      AS total_requests,
      SUM(prompt_tokens + completion_tokens)::text AS total_tokens,
      SUM(CASE WHEN cache_hit THEN 1 ELSE 0 END)::text AS cache_hits
    FROM usage_events
    WHERE org_id = $1 AND created_at BETWEEN $2 AND $3
  `, [opts.orgId, opts.periodStart + ' 00:00:00', opts.periodEnd + ' 23:59:59']);

  const totalCost = parseFloat(totals?.total_cost ?? '0');
  const totalReqs = parseInt(totals?.total_requests ?? '0');
  const cacheHits = parseInt(totals?.cache_hits ?? '0');

  const reportData: ReportData = {
    orgName:        opts.orgName ?? opts.orgId,
    periodStart:    opts.periodStart,
    periodEnd:      opts.periodEnd,
    totalCostUsd:   totalCost,
    totalRequests:  totalReqs,
    totalTokens:    parseInt(totals?.total_tokens ?? '0'),
    cacheHitRate:   totalReqs > 0 ? cacheHits / totalReqs : 0,
    generatedAt:    new Date().toISOString(),
    rows: rows.map(r => ({
      label:        r.label,
      requestCount: parseInt(r.request_count),
      totalTokens:  parseInt(r.total_tokens ?? '0'),
      costUsd:      parseFloat(r.cost_usd),
      pct:          totalCost > 0 ? (parseFloat(r.cost_usd) / totalCost) * 100 : 0,
    })),
  };

  const fileStream = createWriteStream(filePath);
  await renderPDF(reportData, fileStream);
}

async function generateCSVReport(opts: GenerateReportOptions, filePath: string): Promise<void> {
  const fileStream = createWriteStream(filePath);
  await streamCSV(pool, {
    orgId:       opts.orgId,
    periodStart: opts.periodStart,
    periodEnd:   opts.periodEnd,
    teamId:      opts.teamId,
    userId:      opts.userId,
    provider:    opts.provider,
  }, fileStream);
}

// ── Routes ────────────────────────────────────────────────────────────────────

app.get('/health', async () => ({
  status: 'ok',
  service: 'report-service',
  version: '2.0.0',
}));

app.post('/reports/generate', async (req, reply) => {
  const parsed = GenerateReportSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: 'validation_error', details: parsed.error.errors });
  }

  try {
    const reportId = await generateReport(parsed.data);
    return reply.status(202).send({ report_id: reportId, status: 'generating' });
  } catch (err) {
    req.log.error(err);
    return reply.status(500).send({ error: 'generation_failed', message: String(err) });
  }
});

app.get('/reports', async (req, reply) => {
  const { org_id, limit = '20', offset = '0' } = req.query as Record<string, string>;
  if (!org_id) return reply.status(400).send({ error: 'org_id required' });

  const { rows } = await pool.query(
    `SELECT id, report_type, format, status, period_start, period_end,
            file_size_bytes, row_count, completed_at, created_at
     FROM generated_reports
     WHERE org_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [org_id, parseInt(limit), parseInt(offset)],
  );
  return { reports: rows };
});

app.get('/reports/:id/download', async (req, reply) => {
  const { id } = req.params as { id: string };
  const { rows: [report] } = await pool.query(
    `SELECT file_path, format, status, period_start, period_end, org_id
     FROM generated_reports WHERE id = $1`,
    [id],
  );

  if (!report) return reply.status(404).send({ error: 'not_found' });
  if (report.status !== 'ready') {
    return reply.status(202).send({ status: report.status });
  }
  if (!existsSync(report.file_path)) {
    return reply.status(410).send({ error: 'file_expired' });
  }

  const filename = `report-${report.period_start}-${report.period_end}.${report.format}`;
  const contentType = report.format === 'pdf' ? 'application/pdf' : 'text/csv';

  reply.header('Content-Type', contentType);
  reply.header('Content-Disposition', `attachment; filename="${filename}"`);

  return reply.send(createReadStream(report.file_path));
});

// ── Start ─────────────────────────────────────────────────────────────────────

const start = async () => {
  try {
    await pool.query('SELECT 1');
    app.log.info('Postgres connected');

    // Register monthly scheduler
    startMonthlyScheduler(pool);

    await app.listen({ port: PORT, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
