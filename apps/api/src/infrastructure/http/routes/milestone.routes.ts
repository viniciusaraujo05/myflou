import type { FastifyInstance } from 'fastify'
import { CreateMilestoneBodySchema, UpdateMilestoneBodySchema, GetMilestonesQuerySchema } from '../schemas/milestone.http-schema.js'
import { getRequestUserId } from '../request-user.js'

export async function milestoneRoutes(app: FastifyInstance) {
  const auth = { preHandler: [app.authenticate] }

  // GET /milestones?space=<id>
  app.get('/', auth, async (request, reply) => {
    const parsed = GetMilestonesQuerySchema.safeParse(request.query)
    if (!parsed.success) {
      return reply.status(400).send({ statusCode: 400, message: parsed.error.issues[0]?.message ?? 'Validation error', code: 'VALIDATION_ERROR' })
    }
    const userId = getRequestUserId(request)
    const milestones = await app.container.milestone.getMilestones.execute({ userId, spaceId: parsed.data.space })
    return reply.send(milestones)
  })

  app.post('/', { ...auth, config: { rateLimit: { max: 60, timeWindow: '1m' } } }, async (request, reply) => {
    const parsed = CreateMilestoneBodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ statusCode: 400, message: parsed.error.issues[0]?.message ?? 'Validation error', code: 'VALIDATION_ERROR' })
    }
    const userId = getRequestUserId(request)
    const milestone = await app.container.milestone.createMilestone.execute({ userId, ...parsed.data })
    return reply.status(201).send(milestone)
  })

  app.patch('/:id', auth, async (request, reply) => {
    const { id: milestoneId } = request.params as { id: string }
    const parsed = UpdateMilestoneBodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ statusCode: 400, message: parsed.error.issues[0]?.message ?? 'Validation error', code: 'VALIDATION_ERROR' })
    }
    const userId = getRequestUserId(request)
    const milestone = await app.container.milestone.updateMilestone.execute({ milestoneId, userId, ...parsed.data })
    return reply.send(milestone)
  })

  app.delete('/:id', auth, async (request, reply) => {
    const { id: milestoneId } = request.params as { id: string }
    const userId = getRequestUserId(request)
    await app.container.milestone.deleteMilestone.execute({ milestoneId, userId })
    return reply.status(204).send()
  })
}
