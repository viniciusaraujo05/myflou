import type { FastifyInstance } from 'fastify'
import { CreateInboxItemBodySchema, UpdateInboxItemBodySchema, GetInboxQuerySchema } from '../schemas/inbox.http-schema.js'
import { getRequestUserId } from '../request-user.js'

export async function inboxRoutes(app: FastifyInstance) {
  const auth = { preHandler: [app.authenticate] }

  app.get('/', auth, async (request, reply) => {
    const parsed = GetInboxQuerySchema.safeParse(request.query)
    if (!parsed.success) {
      return reply.status(400).send({ statusCode: 400, message: parsed.error.issues[0]?.message ?? 'Validation error', code: 'VALIDATION_ERROR' })
    }
    const userId = getRequestUserId(request)
    const items = await app.container.inbox.getItems.execute({ userId, status: parsed.data.status })
    return reply.send(items)
  })

  app.post('/', { ...auth, config: { rateLimit: { max: 120, timeWindow: '1m' } } }, async (request, reply) => {
    const parsed = CreateInboxItemBodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ statusCode: 400, message: parsed.error.issues[0]?.message ?? 'Validation error', code: 'VALIDATION_ERROR' })
    }
    const userId = getRequestUserId(request)
    const item = await app.container.inbox.createItem.execute({ userId, ...parsed.data })
    return reply.status(201).send(item)
  })

  app.patch('/:id', auth, async (request, reply) => {
    const { id: itemId } = request.params as { id: string }
    const parsed = UpdateInboxItemBodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ statusCode: 400, message: parsed.error.issues[0]?.message ?? 'Validation error', code: 'VALIDATION_ERROR' })
    }
    const userId = getRequestUserId(request)
    const item = await app.container.inbox.updateItem.execute({ itemId, userId, ...parsed.data })
    return reply.send(item)
  })

  app.delete('/:id', auth, async (request, reply) => {
    const { id: itemId } = request.params as { id: string }
    const userId = getRequestUserId(request)
    await app.container.inbox.deleteItem.execute({ itemId, userId })
    return reply.status(204).send()
  })
}
