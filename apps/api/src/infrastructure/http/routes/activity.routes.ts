import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { getRequestUserId } from '../request-user.js'

const QuerySchema = z.object({
  space: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
})

export async function activityRoutes(app: FastifyInstance) {
  const auth = { preHandler: [app.authenticate] }

  app.get('/', auth, async (request, reply) => {
    const parsed = QuerySchema.safeParse(request.query)
    if (!parsed.success) {
      return reply.status(400).send({ statusCode: 400, message: parsed.error.issues[0]?.message ?? 'Validation error', code: 'VALIDATION_ERROR' })
    }
    const userId = getRequestUserId(request)
    const events = await app.container.activity.getActivity.execute({ userId, spaceId: parsed.data.space, limit: parsed.data.limit })
    return reply.send(events)
  })
}
