import { FastifyInstance } from 'fastify'
import { z } from 'zod'

const AlertQuerySchema = z.object({
  severity:  z.enum(['critical', 'warning', 'info']).optional(),
  type:      z.string().optional(),
  is_read:   z.coerce.boolean().optional(),
  limit:     z.coerce.number().min(1).max(200).default(50),
  offset:    z.coerce.number().min(0).default(0),
})

export async function alertRoutes(app: FastifyInstance) {
  // GET /alerts — list alerts for org
  app.get('/alerts', async (req, reply) => {
    const query  = AlertQuerySchema.parse(req.query)
    const { orgId } = req.user

    const conditions: string[] = ['org_id = $1']
    const params: unknown[]    = [orgId]
    let idx = 2

    if (query.severity) {
      conditions.push(`severity = $${idx}`)
      params.push(query.severity); idx++
    }
    if (query.type) {
      conditions.push(`type = $${idx}`)
      params.push(query.type); idx++
    }
    if (query.is_read !== undefined) {
      conditions.push(`is_read = $${idx}`)
      params.push(query.is_read); idx++
    }

    const where = conditions.join(' AND ')

    const countResult = await app.db.query(
      `SELECT COUNT(*) AS total FROM alert_events WHERE ${where}`,
      params,
    )
    const total = parseInt(countResult.rows[0]?.total ?? '0', 10)

    const result = await app.db.query(
      `SELECT id, org_id, team_id, user_id, type, severity, message, metadata, is_read, created_at
       FROM alert_events
       WHERE ${where}
       ORDER BY created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, query.limit, query.offset],
    )

    return reply.send({ total, limit: query.limit, offset: query.offset, rows: result.rows })
  })

  // POST /alerts/:id/acknowledge — mark an alert as read
  app.post('/alerts/:id/acknowledge', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { orgId } = req.user

    await app.db.query(
      `UPDATE alert_events SET is_read = TRUE WHERE id = $1 AND org_id = $2`,
      [id, orgId],
    )
    return reply.status(204).send()
  })

  // POST /alerts/acknowledge-all — mark all unread alerts as read
  app.post('/alerts/acknowledge-all', async (req, reply) => {
    const { orgId } = req.user
    const { severity } = (req.body as any) ?? {}

    let sql = `UPDATE alert_events SET is_read = TRUE WHERE org_id = $1 AND is_read = FALSE`
    const params: unknown[] = [orgId]
    if (severity) {
      sql += ` AND severity = $2`
      params.push(severity)
    }
    await app.db.query(sql, params)
    return reply.status(204).send()
  })

  // GET /alerts/summary — unread counts by severity (for sidebar badge)
  app.get('/alerts/summary', async (req, reply) => {
    const { orgId } = req.user
    const result = await app.db.query(
      `SELECT severity, COUNT(*) AS count
       FROM alert_events
       WHERE org_id = $1 AND is_read = FALSE
       GROUP BY severity`,
      [orgId],
    )
    const summary: Record<string, number> = { critical: 0, warning: 0, info: 0 }
    for (const row of result.rows) {
      summary[row.severity as string] = parseInt(row.count, 10)
    }
    return reply.send({ unread: summary, total: Object.values(summary).reduce((a, b) => a + b, 0) })
  })
}
