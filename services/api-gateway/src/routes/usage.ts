import { FastifyInstance } from 'fastify'
import { z } from 'zod'

const UsageQuerySchema = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  group_by: z.enum(['user', 'team', 'department', 'provider', 'model', 'project']).optional(),
  provider: z.string().optional(),
  team_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(1000).default(100),
})

export async function usageRoutes(app: FastifyInstance) {
  // GET /usage — query usage with flexible grouping
  app.get('/usage', async (req, reply) => {
    const query = UsageQuerySchema.parse(req.query)
    const { orgId } = req.user

    // ClickHouse query via HTTP API
    const ch_query = buildClickHouseQuery(orgId, query)
    const response = await fetch(`${process.env.CLICKHOUSE_URL}/?query=${encodeURIComponent(ch_query)}`)
    const data = await response.text()

    return reply.send({
      period: { start: query.start, end: query.end },
      group_by: query.group_by,
      rows: parseClickHouseResponse(data),
    })
  })

  // GET /usage/summary — quick summary for dashboard KPIs
  app.get('/usage/summary', async (req, reply) => {
    const { orgId } = req.user
    const summary = await app.clickhouse.query(`
      SELECT
        sum(total_cost_usd)     AS total_cost_usd,
        sum(request_count)      AS total_requests,
        sum(total_prompt_tokens + total_completion_tokens) AS total_tokens,
        countDistinct(team_id)  AS active_teams,
        countDistinct(provider) AS providers_used
      FROM daily_cost_summary
      WHERE org_id = '${orgId}'
        AND event_date >= toDate(now()) - 30
    `)
    return reply.send(summary)
  })
}

function buildClickHouseQuery(orgId: string, query: z.infer<typeof UsageQuerySchema>) {
  const groupField = query.group_by || 'provider'
  return `
    SELECT
      ${groupField},
      sum(total_cost_usd)    AS cost_usd,
      sum(request_count)     AS requests,
      sum(total_prompt_tokens)     AS prompt_tokens,
      sum(total_completion_tokens) AS completion_tokens
    FROM daily_cost_summary
    WHERE org_id = '${orgId}'
      AND event_date BETWEEN '${query.start}' AND '${query.end}'
      ${query.provider ? `AND provider = '${query.provider}'` : ''}
      ${query.team_id  ? `AND team_id  = '${query.team_id}'`  : ''}
    GROUP BY ${groupField}
    ORDER BY cost_usd DESC
    LIMIT ${query.limit}
    FORMAT JSON
  `
}

function parseClickHouseResponse(raw: string) {
  try { return JSON.parse(raw).data } catch { return [] }
}
