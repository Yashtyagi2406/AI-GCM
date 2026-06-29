import { FastifyInstance } from 'fastify'

/**
 * Key routes proxy requests to the key-vault service.
 * The API gateway never sees plaintext keys — the key-vault handles encryption.
 */
export async function keyRoutes(app: FastifyInstance) {
  // GET /keys — list all API keys for org (always masked)
  app.get('/keys', async (req, reply) => {
    const res = await fetch(`${app.keyVaultUrl}/keys`, {
      headers: { 'X-Org-ID': req.user.orgId },
    })
    const data = await res.json()
    return reply.status(res.status).send(data)
  })

  // POST /keys — add a new API key
  app.post('/keys', async (req, reply) => {
    const body = req.body as Record<string, unknown>
    const res = await fetch(`${app.keyVaultUrl}/keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Org-ID': req.user.orgId,
      },
      body: JSON.stringify({ ...body, created_by: req.user.userId }),
    })
    const data = await res.json()
    return reply.status(res.status).send(data)
  })

  // GET /keys/:id — get a single key (masked)
  app.get('/keys/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const res = await fetch(`${app.keyVaultUrl}/keys/${id}`, {
      headers: { 'X-Org-ID': req.user.orgId },
    })
    const data = await res.json()
    return reply.status(res.status).send(data)
  })

  // POST /keys/:id/rotate — rotate a key
  app.post('/keys/:id/rotate', async (req, reply) => {
    const { id } = req.params as { id: string }
    const body = req.body as Record<string, unknown>
    const res = await fetch(`${app.keyVaultUrl}/keys/${id}/rotate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Org-ID': req.user.orgId,
      },
      body: JSON.stringify({ ...body, rotated_by: req.user.userId }),
    })
    const data = await res.json()
    return reply.status(res.status).send(data)
  })

  // DELETE /keys/:id — deactivate a key
  app.delete('/keys/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const res = await fetch(`${app.keyVaultUrl}/keys/${id}`, {
      method: 'DELETE',
      headers: { 'X-Org-ID': req.user.orgId },
    })
    if (res.status === 204) return reply.status(204).send()
    const data = await res.json()
    return reply.status(res.status).send(data)
  })
}
