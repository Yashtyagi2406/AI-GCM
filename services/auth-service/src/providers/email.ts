import bcrypt from 'bcryptjs'
import type { Pool } from 'pg'
import { z } from 'zod'

const BCRYPT_ROUNDS = 12

// ── Schema ────────────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  org_name:  z.string().min(2).max(255),
  org_slug:  z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'slug must be lowercase letters, numbers, and hyphens'),
  email:     z.string().email(),
  name:      z.string().min(1).max(255),
  password:  z.string().min(8).max(128),
})

export const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UserRecord {
  id:        string
  org_id:    string
  team_id:   string | null
  email:     string
  name:      string
  role:      string
  is_active: boolean
}

// ── Functions ─────────────────────────────────────────────────────────────────

/**
 * Register a new organization and its first admin user.
 * Returns the created user record.
 */
export async function registerUser(
  db: Pool,
  data: z.infer<typeof RegisterSchema>,
): Promise<UserRecord> {
  const client = await db.connect()
  try {
    await client.query('BEGIN')

    // Create organization
    const orgResult = await client.query(
      `INSERT INTO organizations (name, slug, billing_email, plan)
       VALUES ($1, $2, $3, 'free')
       RETURNING id`,
      [data.org_name, data.org_slug, data.email],
    )
    const orgId = orgResult.rows[0].id as string

    // Hash password and store in a separate credential table
    // (users table stores SSO/email users; password hash in user_credentials)
    const hash = await bcrypt.hash(data.password, BCRYPT_ROUNDS)

    // Insert user with super_admin role (first user of org)
    const userResult = await client.query(
      `INSERT INTO users (org_id, email, name, role)
       VALUES ($1, $2, $3, 'super_admin')
       RETURNING id, org_id, team_id, email, name, role, is_active`,
      [orgId, data.email, data.name],
    )
    const user = userResult.rows[0] as UserRecord

    // Store password hash in user_credentials table
    await client.query(
      `INSERT INTO user_credentials (user_id, password_hash) VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET password_hash = $2, updated_at = NOW()`,
      [user.id, hash],
    )

    await client.query('COMMIT')
    return user
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

/**
 * Validate email + password credentials.
 * Returns user record on success, null on failure.
 */
export async function validateCredentials(
  db: Pool,
  email: string,
  password: string,
): Promise<UserRecord | null> {
  const result = await db.query(
    `SELECT u.id, u.org_id, u.team_id, u.email, u.name, u.role, u.is_active,
            uc.password_hash
     FROM users u
     JOIN user_credentials uc ON uc.user_id = u.id
     WHERE u.email = $1 AND u.is_active = TRUE`,
    [email],
  )
  if (!result.rows[0]) return null

  const row = result.rows[0]
  const match = await bcrypt.compare(password, row.password_hash as string)
  if (!match) return null

  // Update last_login_at
  await db.query(`UPDATE users SET last_login_at = NOW() WHERE id = $1`, [row.id])

  return {
    id:        row.id,
    org_id:    row.org_id,
    team_id:   row.team_id,
    email:     row.email,
    name:      row.name,
    role:      row.role,
    is_active: row.is_active,
  }
}
