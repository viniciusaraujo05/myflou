import type { FastifyInstance } from 'fastify'
import { CreateStatusBodySchema, UpdateStatusBodySchema } from '../schemas/status.http-schema.js'
import { getRequestUserId } from '../request-user.js'

export async function statusRoutes(app: FastifyInstance) {
  const auth = { preHandler: [app.authenticate] }

  // GET /statuses
  app.get('/', auth, async (request, reply) => {
    const userId = getRequestUserId(request)
    const statuses = await app.container.status.getStatuses.execute(userId)
    return reply.send(statuses)
  })

  // POST /statuses
  app.post('/', auth, async (request, reply) => {
    const parsed = CreateStatusBodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        message: parsed.error.issues[0]?.message ?? 'Validation error',
        code: 'VALIDATION_ERROR',
      })
    }
    const userId = getRequestUserId(request)
    const status = await app.container.status.createStatus.execute({ userId, ...parsed.data })
    return reply.status(201).send(status)
  })

  // PATCH /statuses/:id
  app.patch('/:id', auth, async (request, reply) => {
    const { id: statusId } = request.params as { id: string }
    const parsed = UpdateStatusBodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        message: parsed.error.issues[0]?.message ?? 'Validation error',
        code: 'VALIDATION_ERROR',
      })
    }
    const userId = getRequestUserId(request)
    const status = await app.container.status.updateStatus.execute({ userId, statusId, ...parsed.data })
    return reply.send(status)
  })

  // DELETE /statuses/:id
  app.delete('/:id', auth, async (request, reply) => {
    const { id: statusId } = request.params as { id: string }
    const userId = getRequestUserId(request)
    await app.container.status.deleteStatus.execute({ userId, statusId })
    return reply.status(204).send()
  })
}
