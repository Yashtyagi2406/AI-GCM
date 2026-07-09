import { FastifyInstance } from 'fastify'

/**
 * Report routes proxy requests to the report-service.
 * Gateways handles authorization and passes orgId as part of the request payload or headers.
 */
export async function reportRoutes(app: FastifyInstance) {
  // GET /reports — list all reports for the user's org
  app.get('/reports', async (req, reply) => {
    const url = new URL(`${app.reportServiceUrl}/reports`)
    url.searchParams.set('org_id', req.user.orgId)
    const { limit, offset } = req.query as Record<string, string>
    if (limit) url.searchParams.set('limit', limit)
    if (offset) url.searchParams.set('offset', offset)

    const res = await fetch(url.toString())
    const data = await res.json()
    return reply.status(res.status).send(data)
  })

  // POST /reports/generate — request a new report
  app.post('/reports/generate', async (req, reply) => {
    const body = req.body as Record<string, unknown>
    const res = await fetch(`${app.reportServiceUrl}/reports/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...body,
        orgId: req.user.orgId,
        requestedBy: req.user.userId,
      }),
    })
    const data = await res.json()
    return reply.status(res.status).send(data)
  })

  // GET /reports/:id/download — download report file
  app.get('/reports/:id/download', async (req, reply) => {
    const { id } = req.params as { id: string }
    const res = await fetch(`${app.reportServiceUrl}/reports/${id}/download`)

    if (res.status !== 200) {
      if (res.status === 202) {
        return reply.status(202).send(await res.json())
      }
      return reply.status(res.status).send({ error: 'failed_download', status: res.status })
    }

    // Stream download directly from report service
    const contentType = res.headers.get('Content-Type') || 'application/octet-stream'
    const contentDisp = res.headers.get('Content-Disposition') || `attachment; filename="report-${id}"`
    
    reply.header('Content-Type', contentType)
    reply.header('Content-Disposition', contentDisp)

    // Using readable stream from response body
    if (res.body) {
      return reply.send(res.body)
    }
    return reply.status(500).send({ error: 'empty_body' })
  })
}
