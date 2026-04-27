import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

const ClassifyBodySchema = z.object({
  text: z.string().min(1).max(10000),
})

export async function aiRoutes(app: FastifyInstance) {
  const auth = { preHandler: [app.authenticate] }

  app.post('/classify', auth, async (request, reply) => {
    const parsed = ClassifyBodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        message: parsed.error.errors[0]?.message ?? 'Validation error',
      })
    }
    const { sub: userId } = request.user as { sub: string }
    try {
      const result = await app.container.ai.classify.execute(userId, parsed.data.text)
      return reply.send(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI classification failed'
      return reply.status(500).send({ statusCode: 500, message })
    }
  })
}
