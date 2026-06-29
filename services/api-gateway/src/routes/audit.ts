import { FastifyInstance } from 'fastify'
import { z } from 'zod'

const AuditQuerySchema = z.object({
  start:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  user_id:    z.string().uuid().optional(),
  team_id:    z.string().uuid().optional(),
  provider:   z.string().optional(),
  model:      z.string().optional(),
  status:     z.enum(['success', 'blocked', 'error']).optional(),
  dlp_only:   z.coerce.boolean().optional(),
  limit:      z.coerce.number().min(1).max(1000).default(100),
  offset:     z.coerce.number().min(0).default(0),
})

export async function auditRoutes(app: FastifyInstance) {
  // GET /audit — searchable audit log
  app.get('/audit', async (req, reply) => {
    const query  = AuditQuerySchema.parse(req.query)
    const { orgId } = req.user

    const conditions: string[] = ['org_id = $1']
    const params: unknown[]    = [orgId]
    let idx = 2

    if (query.start) {
      conditions.push(`created_at >= $${idx}::date`)
      params.push(query.start); idx++
    }
    if (query.end) {
      conditions.push(`created_at < ($${idx}::date + interval '1 day')`)
      params.push(query.end); idx++
    }
    if (query.user_id) {
      conditions.push(`user_id = $${idx}`)
      params.push(query.user_id); idx++
    }
    if (query.team_id) {
      conditions.push(`team_id = $${idx}`)
      params.push(query.team_id); idx++
    }
    if (query.provider) {
      conditions.push(`provider = $${idx}`)
      params.push(query.provider); idx++
    }
    if (query.model) {
      conditions.push(`model ILIKE $${idx}`)
      params.push(`%${query.model}%`); idx++
    }
    if (query.status) {
      conditions.push(`status = $${idx}`)
      params.push(query.status); idx++
    }
    if (query.dlp_only) {
      conditions.push('dlp_violation = TRUE')
    }

    const where = conditions.join(' AND ')

    const countResult = await app.db.query(
      `SELECT COUNT(*) AS total FROM usage_events WHERE ${where}`,
      params,
    )
    const total = parseInt(countResult.rows[0].total, 10)

    const result = await app.db.query(
      `SELECT
         id, user_id, team_id, provider, model,
         prompt_tokens, completion_tokens, total_tokens,
         cost_usd, latency_ms, status, request_id,
         dlp_violation, policy_blocked, cache_hit, is_batch,
         created_at
       FROM usage_events
       WHERE ${where}
       ORDER BY created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, query.limit, query.offset],
    )

    return reply.send({
      total,
      limit:  query.limit,
      offset: query.offset,
      rows:   result.rows,
    })
  })

  // GET /audit/:requestId — single request detail
  app.get('/audit/:requestId', async (req, reply) => {
    const { requestId } = req.params as { requestId: string }
    const { orgId } = req.user

    const result = await app.db.query(
      `SELECT * FROM usage_events WHERE request_id = $1 AND org_id = $2 LIMIT 1`,
      [requestId, orgId],
    )
    if (!result.rows[0]) return reply.status(404).send({ error: 'Request not found' })
    return reply.send(result.rows[0])
  })
}
