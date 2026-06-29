import Fastify from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import { Pool } from 'pg'

import { authenticate } from './middleware/authenticate.js'
import { budgetRoutes } from './routes/budgets.js'
import { usageRoutes } from './routes/usage.js'
import { keyRoutes } from './routes/keys.js'
import { auditRoutes } from './routes/audit.js'
import { alertRoutes } from './routes/alerts.js'

// ── Config ────────────────────────────────────────────────────────────────────
const PORT    = parseInt(process.env.PORT || '3001', 10)
const DB_URL  = process.env.DATABASE_URL || 'postgresql://aigcm:password@localhost:5432/aigcm'
const KEY_VAULT_URL = process.env.KEY_VAULT_URL || 'http://localhost:3003'

// ── DB pool ───────────────────────────────────────────────────────────────────
const db = new Pool({ connectionString: DB_URL })

// Extend Fastify with db + key-vault URL
declare module 'fastify' {
  interface FastifyInstance {
    db: Pool
    keyVaultUrl: string
    clickhouse: { query: (q: string) => Promise<any> }  // Phase 2 stub
  }
  interface FastifyRequest {
    user: { id: string; userId: string; orgId: string; teamId: string; role: string }
  }
}

// ── Server ────────────────────────────────────────────────────────────────────
const app = Fastify({ logger: { level: process.env.LOG_LEVEL || 'info' } })

await app.register(cors, { origin: process.env.CORS_ORIGIN || '*' })
await app.register(rateLimit, {
  global: true,
  max:    200,
  timeWindow: '1 minute',
})

// Decorate with shared clients
app.decorate('db', db)
app.decorate('keyVaultUrl', KEY_VAULT_URL)
app.decorate('clickhouse', {
  query: async (_q: string) => ({ data: [], rows: 0 }), // Phase 2 stub
})

// ── Auth hook ─────────────────────────────────────────────────────────────────
// All routes except /health are protected
app.addHook('preHandler', async (req, reply) => {
  if (req.routerPath === '/health') return
  await authenticate(req, reply)
})

// ── Routes ────────────────────────────────────────────────────────────────────
await app.register(budgetRoutes)
await app.register(usageRoutes)
await app.register(keyRoutes)
await app.register(auditRoutes)
await app.register(alertRoutes)

// Health check
app.get('/health', async (_req, reply) => {
  return reply.send({ status: 'ok', service: 'api-gateway', version: '1.0.0' })
})

// ── Start ─────────────────────────────────────────────────────────────────────
try {
  await app.listen({ port: PORT, host: '0.0.0.0' })
  app.log.info(`[api-gateway] listening on :${PORT}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
