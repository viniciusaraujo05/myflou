import type { FastifyInstance } from 'fastify'
import { CreateRelationBodySchema, GetRelationsQuerySchema } from '../schemas/relation.http-schema.js'
import { getRequestUserId } from '../request-user.js'

export async function relationRoutes(app: FastifyInstance) {
  const auth = { preHandler: [app.authenticate] }

  // GET /relations?type=TASK&id=<id>
  app.get('/', auth, async (request, reply) => {
    const parsed = GetRelationsQuerySchema.safeParse(request.query)
    if (!parsed.success) {
      return reply.status(400).send({ statusCode: 400, message: parsed.error.issues[0]?.message ?? 'Validation error', code: 'VALIDATION_ERROR' })
    }
    const userId = getRequestUserId(request)
    const related = await app.container.relation.getRelations.execute({ userId, ...parsed.data })
    return reply.send(related)
  })

  app.post('/', { ...auth, config: { rateLimit: { max: 120, timeWindow: '1m' } } }, async (request, reply) => {
    const parsed = CreateRelationBodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ statusCode: 400, message: parsed.error.issues[0]?.message ?? 'Validation error', code: 'VALIDATION_ERROR' })
    }
    const userId = getRequestUserId(request)
    const link = await app.container.relation.createRelation.execute({ userId, ...parsed.data })
    return reply.status(201).send(link)
  })

  app.delete('/:id', auth, async (request, reply) => {
    const { id: linkId } = request.params as { id: string }
    const userId = getRequestUserId(request)
    await app.container.relation.deleteRelation.execute({ linkId, userId })
    return reply.status(204).send()
  })
}
