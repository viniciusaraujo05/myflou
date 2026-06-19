import type { FastifyInstance } from 'fastify'
import { StartFocusBodySchema, TimeSummaryQuerySchema } from '../schemas/time-session.http-schema.js'
import { getRequestUserId } from '../request-user.js'

export async function timeSessionRoutes(app: FastifyInstance) {
  const auth = { preHandler: [app.authenticate] }

  app.get('/active', auth, async (request, reply) => {
    const userId = getRequestUserId(request)
    const session = await app.container.timeSession.getActive.execute({ userId })
    return reply.send(session)
  })

  app.get('/summary', auth, async (request, reply) => {
    const parsed = TimeSummaryQuerySchema.safeParse(request.query)
    if (!parsed.success) {
      return reply.status(400).send({ statusCode: 400, message: parsed.error.issues[0]?.message ?? 'Validation error', code: 'VALIDATION_ERROR' })
    }
    const userId = getRequestUserId(request)
    const summary = await app.container.timeSession.getSummary.execute({ userId, spaceId: parsed.data.space })
    return reply.send(summary)
  })

  app.post('/start', { ...auth, config: { rateLimit: { max: 60, timeWindow: '1m' } } }, async (request, reply) => {
    const parsed = StartFocusBodySchema.safeParse(request.body ?? {})
    if (!parsed.success) {
      return reply.status(400).send({ statusCode: 400, message: parsed.error.issues[0]?.message ?? 'Validation error', code: 'VALIDATION_ERROR' })
    }
    const userId = getRequestUserId(request)
    const session = await app.container.timeSession.start.execute({ userId, ...parsed.data })
    return reply.status(201).send(session)
  })

  app.post('/stop', auth, async (request, reply) => {
    const userId = getRequestUserId(request)
    const session = await app.container.timeSession.stop.execute({ userId })
    return reply.send(session)
  })
}
