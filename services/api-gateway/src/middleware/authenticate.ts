import { FastifyRequest, FastifyReply } from 'fastify'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret')

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Missing or invalid Authorization header' })
  }

  const token = header.slice(7)
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    req.user = {
      id:     payload.sub as string,
      orgId:  payload.org_id as string,
      teamId: payload.team_id as string,
      role:   payload.role as string,
      userId: payload.sub as string,
    }
  } catch {
    return reply.status(401).send({ error: 'Invalid or expired token' })
  }
}
