import { FastifyInstance } from 'fastify'
import { z } from 'zod'

const CreateBudgetSchema = z.object({
  name: z.string().min(1).max(255),
  scope_type: z.enum(['org', 'department', 'team', 'project', 'user']),
  scope_id: z.string().uuid(),
  amount_usd: z.number().positive(),
  period: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'annual']),
  alert_thresholds: z.array(z.number().min(1).max(100)).default([50, 75, 90, 100]),
  hard_limit: z.boolean().default(false),
  rollover: z.boolean().default(false),
})

export async function budgetRoutes(app: FastifyInstance) {
  // GET /budgets — list all budgets for org
  app.get('/budgets', async (req, reply) => {
    const { orgId } = req.user
    const budgets = await app.db.query(
      `SELECT b.*, bs.spent_usd,
        ROUND((bs.spent_usd / b.amount_usd) * 100, 2) AS utilization_pct
       FROM budgets b
       LEFT JOIN budget_spend bs ON bs.budget_id = b.id
         AND bs.period_key = TO_CHAR(NOW(), 'YYYY-MM')
       WHERE b.org_id = $1 AND b.is_active = TRUE
       ORDER BY b.created_at DESC`,
      [orgId]
    )
    return reply.send({ budgets: budgets.rows })
  })

  // POST /budgets — create a new budget
  app.post('/budgets', async (req, reply) => {
    const body = CreateBudgetSchema.parse(req.body)
    const { orgId, userId } = req.user

    const result = await app.db.query(
      `INSERT INTO budgets (org_id, name, scope_type, scope_id, amount_usd, period,
        alert_thresholds, hard_limit, rollover, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [orgId, body.name, body.scope_type, body.scope_id, body.amount_usd,
       body.period, body.alert_thresholds, body.hard_limit, body.rollover, userId]
    )
    return reply.status(201).send(result.rows[0])
  })

  // GET /budgets/:id — get single budget with current spend
  app.get('/budgets/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { orgId } = req.user
    const result = await app.db.query(
      `SELECT b.*, bs.spent_usd,
        (b.amount_usd - COALESCE(bs.spent_usd,0)) AS remaining_usd,
        ROUND((COALESCE(bs.spent_usd,0) / b.amount_usd) * 100, 2) AS utilization_pct
       FROM budgets b
       LEFT JOIN budget_spend bs ON bs.budget_id = b.id
         AND bs.period_key = TO_CHAR(NOW(), 'YYYY-MM')
       WHERE b.id = $1 AND b.org_id = $2`,
      [id, orgId]
    )
    if (!result.rows[0]) return reply.status(404).send({ error: 'Budget not found' })
    return reply.send(result.rows[0])
  })

  // DELETE /budgets/:id — deactivate budget
  app.delete('/budgets/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { orgId } = req.user
    await app.db.query(
      `UPDATE budgets SET is_active = FALSE, updated_at = NOW() WHERE id = $1 AND org_id = $2`,
      [id, orgId]
    )
    return reply.status(204).send()
  })
}
