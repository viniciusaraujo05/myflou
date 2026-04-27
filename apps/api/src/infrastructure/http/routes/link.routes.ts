import type { FastifyInstance } from 'fastify'
import { CreateLinkSchema, UpdateLinkSchema, GetLinksQuerySchema } from '../schemas/link.http-schema.js'
import { getRequestUserId } from '../request-user.js'

export async function linkRoutes(app: FastifyInstance) {
  const auth = { preHandler: [app.authenticate] }

  app.get('/', auth, async (request, reply) => {
    const parsed = GetLinksQuerySchema.safeParse(request.query)
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        message: parsed.error.errors[0]?.message ?? 'Validation error',
        code: 'VALIDATION_ERROR',
      })
    }
    const userId = getRequestUserId(request)
    const links = await app.container.link.getLinks.execute({ userId, ...parsed.data })
    return reply.send(links)
  })

  app.post('/', auth, async (request, reply) => {
    const parsed = CreateLinkSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        message: parsed.error.errors[0]?.message ?? 'Validation error',
        code: 'VALIDATION_ERROR',
      })
    }
    const userId = getRequestUserId(request)
    const link = await app.container.link.createLink.execute({ userId, ...parsed.data })
    return reply.status(201).send(link)
  })

  app.patch('/:id', auth, async (request, reply) => {
    const { id: linkId } = request.params as { id: string }
    const parsed = UpdateLinkSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        message: parsed.error.errors[0]?.message ?? 'Validation error',
        code: 'VALIDATION_ERROR',
      })
    }
    const userId = getRequestUserId(request)
    const link = await app.container.link.updateLink.execute({ linkId, userId, ...parsed.data })
    return reply.send(link)
  })

  app.delete('/:id', auth, async (request, reply) => {
    const { id: linkId } = request.params as { id: string }
    const userId = getRequestUserId(request)
    await app.container.link.deleteLink.execute({ linkId, userId })
    return reply.status(204).send()
  })
}
