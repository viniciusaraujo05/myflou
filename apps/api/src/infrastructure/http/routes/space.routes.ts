import type { FastifyInstance } from 'fastify'
import { CreateSpaceBodySchema, UpdateSpaceBodySchema } from '../schemas/space.http-schema.js'
import { getRequestUserId } from '../request-user.js'

export async function spaceRoutes(app: FastifyInstance) {
  const auth = { preHandler: [app.authenticate] }

  // GET /spaces
  app.get('/', auth, async (request, reply) => {
    const userId = getRequestUserId(request)
    const spaces = await app.container.space.getSpaces.execute({ userId })
    return reply.send(spaces)
  })

  // POST /spaces
  app.post('/', { ...auth, config: { rateLimit: { max: 60, timeWindow: '1m' } } }, async (request, reply) => {
    const parsed = CreateSpaceBodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        message: parsed.error.issues[0]?.message ?? 'Validation error',
        code: 'VALIDATION_ERROR',
      })
    }
    const userId = getRequestUserId(request)
    const space = await app.container.space.createSpace.execute({ userId, ...parsed.data })
    return reply.status(201).send(space)
  })

  // PATCH /spaces/:id
  app.patch('/:id', auth, async (request, reply) => {
    const { id: spaceId } = request.params as { id: string }
    const parsed = UpdateSpaceBodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        message: parsed.error.issues[0]?.message ?? 'Validation error',
        code: 'VALIDATION_ERROR',
      })
    }
    const userId = getRequestUserId(request)
    const space = await app.container.space.updateSpace.execute({ spaceId, userId, ...parsed.data })
    return reply.send(space)
  })

  // DELETE /spaces/:id
  app.delete('/:id', auth, async (request, reply) => {
    const { id: spaceId } = request.params as { id: string }
    const userId = getRequestUserId(request)
    await app.container.space.deleteSpace.execute({ spaceId, userId })
    return reply.status(204).send()
  })
}
