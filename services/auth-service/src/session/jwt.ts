import { SignJWT, jwtVerify } from 'jose'

const ACCESS_SECRET  = new TextEncoder().encode(process.env.JWT_SECRET  || 'dev-access-secret')
const REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret')
const ACCESS_TTL  = '7d'
const REFRESH_TTL = '30d'

export interface TokenPayload {
  sub:     string   // user UUID
  org_id:  string
  team_id: string
  role:    string
  email:   string
}

/** Issue a short-lived access JWT (7 days). */
export async function signAccessToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .setIssuer('ai-gcm-auth')
    .setAudience('ai-gcm-api')
    .sign(ACCESS_SECRET)
}

/** Issue a long-lived refresh JWT (30 days). */
export async function signRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TTL)
    .setIssuer('ai-gcm-auth')
    .sign(REFRESH_SECRET)
}

/** Verify access token — throws on failure. */
export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, ACCESS_SECRET, {
    issuer:   'ai-gcm-auth',
    audience: 'ai-gcm-api',
  })
  return {
    sub:     payload.sub as string,
    org_id:  payload['org_id'] as string,
    team_id: payload['team_id'] as string,
    role:    payload['role'] as string,
    email:   payload['email'] as string,
  }
}

/** Verify refresh token — throws on failure. Returns userId. */
export async function verifyRefreshToken(token: string): Promise<string> {
  const { payload } = await jwtVerify(token, REFRESH_SECRET, {
    issuer: 'ai-gcm-auth',
  })
  return payload.sub as string
}
