import type { Redis } from 'ioredis'
import { v4 as uuidv4 } from 'uuid'
import { signRefreshToken, verifyRefreshToken } from './jwt.js'

const REFRESH_PREFIX = 'refresh:'
const TTL_SECONDS    = 60 * 60 * 24 * 30 // 30 days

/** Store a new refresh token in Redis keyed by a unique session ID. */
export async function createRefreshSession(redis: Redis, userId: string): Promise<string> {
  const token     = await signRefreshToken(userId)
  const sessionId = uuidv4()
  // Store token → userId mapping
  await redis.set(`${REFRESH_PREFIX}${sessionId}`, JSON.stringify({ userId, token }), 'EX', TTL_SECONDS)
  // Return "sessionId.token" so the client stores only one cookie value
  return `${sessionId}.${token}`
}

/**
 * Rotate a refresh session.
 * Verifies the incoming token, deletes the old session, creates a new one.
 * Returns { userId, newRefreshToken } or throws on invalid/expired token.
 */
export async function rotateRefreshSession(
  redis: Redis,
  rawCookie: string,
): Promise<{ userId: string; newRefreshToken: string }> {
  const dotIdx    = rawCookie.indexOf('.')
  if (dotIdx < 0) throw new Error('malformed refresh token')

  const sessionId = rawCookie.slice(0, dotIdx)
  const token     = rawCookie.slice(dotIdx + 1)

  // Validate JWT signature + expiry
  const userId = await verifyRefreshToken(token)

  // Validate Redis record (prevents replay after rotation)
  const record = await redis.get(`${REFRESH_PREFIX}${sessionId}`)
  if (!record) throw new Error('refresh session not found or expired')

  const stored = JSON.parse(record) as { userId: string; token: string }
  if (stored.token !== token || stored.userId !== userId) {
    // Possible token theft — invalidate session immediately
    await redis.del(`${REFRESH_PREFIX}${sessionId}`)
    throw new Error('refresh token mismatch — possible replay attack')
  }

  // Delete old session
  await redis.del(`${REFRESH_PREFIX}${sessionId}`)

  // Issue new session
  const newRefreshToken = await createRefreshSession(redis, userId)
  return { userId, newRefreshToken }
}

/** Revoke a refresh session (logout). */
export async function revokeRefreshSession(redis: Redis, rawCookie: string): Promise<void> {
  const dotIdx    = rawCookie.indexOf('.')
  if (dotIdx < 0) return
  const sessionId = rawCookie.slice(0, dotIdx)
  await redis.del(`${REFRESH_PREFIX}${sessionId}`)
}
