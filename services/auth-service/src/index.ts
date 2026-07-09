import Fastify from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import { Pool } from 'pg'
import { Redis } from 'ioredis'
import { z } from 'zod'

import { RegisterSchema, LoginSchema, registerUser, validateCredentials } from './providers/email.js'
import { signAccessToken } from './session/jwt.js'
import { createRefreshSession, rotateRefreshSession, revokeRefreshSession } from './session/refresh.js'

// ── Config ────────────────────────────────────────────────────────────────────
const PORT     = parseInt(process.env.PORT || '3002', 10)
const DB_URL   = process.env.DATABASE_URL || 'postgresql://aigcm:password@localhost:5432/aigcm'
const REDIS_URL = process.env.REDIS_URL  || 'redis://localhost:6379'

// ── Clients ───────────────────────────────────────────────────────────────────
const db    = new Pool({ connectionString: DB_URL })
const redis = new Redis(REDIS_URL)

// ── Server ────────────────────────────────────────────────────────────────────
const app = Fastify({ logger: { level: process.env.LOG_LEVEL || 'info' } })

await app.register(cors, { origin: process.env.CORS_ORIGIN || '*' })
await app.register(rateLimit, {
  global: true,
  max:    30,
  timeWindow: '1 minute',
  errorResponseBuilder: () => ({ error: 'Too many requests — please slow down.' }),
})

// ── Ensure credentials table exists ───────────────────────────────────────────
await db.query(`
  CREATE TABLE IF NOT EXISTS user_credentials (
    user_id      UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    password_hash VARCHAR(60) NOT NULL,
    updated_at   TIMESTAMPTZ DEFAULT NOW()
  )
`)

// ── Routes ────────────────────────────────────────────────────────────────────

/** POST /auth/register — create org + first admin user */
app.post('/auth/register', async (req, reply) => {
  const body = RegisterSchema.safeParse(req.body)
  if (!body.success) {
    return reply.status(400).send({ error: 'Validation failed', details: body.error.flatten() })
  }

  try {
    const user = await registerUser(db, body.data)
    const accessToken  = await signAccessToken({
      sub:     user.id,
      org_id:  user.org_id,
      team_id: user.team_id ?? '',
      role:    user.role,
      email:   user.email,
    })
    const refreshToken = await createRefreshSession(redis, user.id)

    return reply.status(201).send({
      access_token:  accessToken,
      refresh_token: refreshToken,
      token_type:    'Bearer',
      expires_in:    604800, // 7 days in seconds
      user: { id: user.id, email: user.email, name: user.name, role: user.role, org_id: user.org_id },
    })
  } catch (err: any) {
    if (err.code === '23505') {
      return reply.status(409).send({ error: 'An account with that email or org slug already exists.' })
    }
    app.log.error(err, 'register error')
    return reply.status(500).send({ error: 'Internal server error' })
  }
})

/** POST /auth/login — email + password */
app.post('/auth/login', async (req, reply) => {
  const body = LoginSchema.safeParse(req.body)
  if (!body.success) {
    return reply.status(400).send({ error: 'Validation failed', details: body.error.flatten() })
  }

  const user = await validateCredentials(db, body.data.email, body.data.password)
  if (!user) {
    return reply.status(401).send({ error: 'Invalid email or password.' })
  }

  const accessToken  = await signAccessToken({
    sub:     user.id,
    org_id:  user.org_id,
    team_id: user.team_id ?? '',
    role:    user.role,
    email:   user.email,
  })
  const refreshToken = await createRefreshSession(redis, user.id)

  return reply.send({
    access_token:  accessToken,
    refresh_token: refreshToken,
    token_type:    'Bearer',
    expires_in:    604800,
    user: { id: user.id, email: user.email, name: user.name, role: user.role, org_id: user.org_id },
  })
})

/** POST /auth/refresh — rotate refresh token */
app.post('/auth/refresh', async (req, reply) => {
  const { refresh_token } = (req.body as any) ?? {}
  if (!refresh_token || typeof refresh_token !== 'string') {
    return reply.status(400).send({ error: 'refresh_token is required' })
  }

  try {
    const { userId, newRefreshToken } = await rotateRefreshSession(redis, refresh_token)

    // Fetch user from DB to build fresh access token
    const result = await db.query(
      `SELECT id, org_id, team_id, email, name, role FROM users WHERE id = $1 AND is_active = TRUE`,
      [userId],
    )
    if (!result.rows[0]) return reply.status(401).send({ error: 'User not found or deactivated.' })

    const u = result.rows[0]
    const accessToken = await signAccessToken({
      sub:     u.id,
      org_id:  u.org_id,
      team_id: u.team_id ?? '',
      role:    u.role,
      email:   u.email,
    })

    return reply.send({
      access_token:  accessToken,
      refresh_token: newRefreshToken,
      token_type:    'Bearer',
      expires_in:    604800,
    })
  } catch (err: any) {
    return reply.status(401).send({ error: err.message || 'Invalid refresh token' })
  }
})

/** POST /auth/logout — revoke refresh session */
app.post('/auth/logout', async (req, reply) => {
  const { refresh_token } = (req.body as any) ?? {}
  if (refresh_token && typeof refresh_token === 'string') {
    await revokeRefreshSession(redis, refresh_token)
  }
  return reply.status(204).send()
})

/** GET /health */
app.get('/health', async (_req, reply) => {
  return reply.send({ status: 'ok', service: 'auth-service', version: '1.0.0' })
})

// ── Start ─────────────────────────────────────────────────────────────────────
try {
  await app.listen({ port: PORT, host: '0.0.0.0' })
  app.log.info(`[auth-service] listening on :${PORT}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
