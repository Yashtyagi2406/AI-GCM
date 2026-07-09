/**
 * CSV report renderer — streams usage_events rows as RFC 4180 CSV.
 * Supports large datasets via Node.js Readable streams with chunked transfer.
 */
import { format as formatCsv } from '@fast-csv/format';
import { Writable } from 'stream';
import { Pool } from 'pg';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CsvExportOptions {
  orgId: string;
  periodStart: string;  // YYYY-MM-DD
  periodEnd: string;
  teamId?: string;
  userId?: string;
  provider?: string;
}

// ── Renderer ──────────────────────────────────────────────────────────────────

const CSV_HEADERS = [
  'request_id', 'created_at', 'org_id', 'user_id', 'team_id',
  'provider', 'model', 'prompt_tokens', 'completion_tokens',
  'total_tokens', 'cost_usd', 'latency_ms', 'status',
  'dlp_violation', 'policy_blocked', 'cache_hit',
];

/**
 * streamCSV queries usage_events and streams rows as CSV to the provided
 * Writable (typically an HTTP response). Returns a Promise resolving with
 * the number of rows written.
 */
export async function streamCSV(
  pool: Pool,
  opts: CsvExportOptions,
  output: Writable,
): Promise<number> {
  const csvStream = formatCsv({ headers: true });
  csvStream.pipe(output);

  // Write header row
  csvStream.write(Object.fromEntries(CSV_HEADERS.map(h => [h, h])));

  const conditions: string[] = [
    `org_id = $1`,
    `created_at >= $2`,
    `created_at <= $3`,
  ];
  const params: unknown[] = [opts.orgId, opts.periodStart + ' 00:00:00', opts.periodEnd + ' 23:59:59'];

  if (opts.teamId) {
    conditions.push(`team_id = $${params.length + 1}`);
    params.push(opts.teamId);
  }
  if (opts.userId) {
    conditions.push(`user_id = $${params.length + 1}`);
    params.push(opts.userId);
  }
  if (opts.provider) {
    conditions.push(`provider = $${params.length + 1}`);
    params.push(opts.provider);
  }

  const query = `
    SELECT
      request_id, created_at, org_id::text, user_id::text, team_id::text,
      provider, model,
      prompt_tokens, completion_tokens, (prompt_tokens + completion_tokens) AS total_tokens,
      cost_usd, latency_ms, status,
      dlp_violation, policy_blocked, cache_hit
    FROM usage_events
    WHERE ${conditions.join(' AND ')}
    ORDER BY created_at ASC
  `;

  const client = await pool.connect();
  let rowCount = 0;

  try {
    // Use a cursor-style approach for large datasets
    await client.query('BEGIN');
    await client.query(
      `DECLARE csv_cursor CURSOR FOR ${query}`,
      params,
    );

    const batchSize = 1000;
    while (true) {
      const result = await client.query(`FETCH ${batchSize} FROM csv_cursor`);
      if (result.rows.length === 0) break;

      for (const row of result.rows) {
        csvStream.write(row);
        rowCount++;
      }

      if (result.rows.length < batchSize) break;
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return new Promise((resolve, reject) => {
    csvStream.end(() => resolve(rowCount));
    csvStream.on('error', reject);
  });
}
