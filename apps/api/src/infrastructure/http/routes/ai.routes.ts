import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { getRequestUserId } from '../request-user.js'

const ClassifyBodySchema = z.object({
  text: z.string().min(1).max(10000),
})

const ClassifiedItemSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('note'),
    title: z.string().max(200).default('Untitled'),
    content: z.string().max(20000).default(''),
    folderId: z.string().nullable().optional().default(null),
  }),
  z.object({
    type: z.literal('task'),
    title: z.string().min(1).max(300),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    description: z.string().max(2000).nullable().optional().default(null),
  }),
  z.object({
    type: z.literal('link'),
    url: z.string().url().max(2000),
    title: z.string().min(1).max(300),
    description: z.string().max(2000).nullable().optional().default(null),
    categoryId: z.string().nullable().optional().default(null),
    username: z.string().max(500).nullable().optional().default(null),
    password: z.string().max(1000).nullable().optional().default(null),
  }),
  z.object({
    type: z.literal('credential'),
    service: z.string().min(1).max(300),
    username: z.string().max(500).optional().default(''),
    password: z.string().min(1).max(1000),
    url: z.string().url().nullable().optional().default(null),
    notes: z.string().max(4000).nullable().optional().default(null),
  }),
])

const SaveBodySchema = z.object({
  items: z.array(ClassifiedItemSchema).max(50),
})

export async function aiRoutes(app: FastifyInstance) {
  const auth = { preHandler: [app.authenticate] }

  app.post('/classify', { ...auth, config: { rateLimit: { max: 10, timeWindow: '15m' } } }, async (request, reply) => {
    const parsed = ClassifyBodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        message: parsed.error.errors[0]?.message ?? 'Validation error',
      })
    }
    const userId = getRequestUserId(request)
    try {
      const result = await app.container.ai.classify.preview(userId, parsed.data.text)
      return reply.send(result)
    } catch (err) {
      app.log.error(err)
      return reply.status(500).send({ statusCode: 500, message: 'AI classification failed' })
    }
  })

  app.post('/save', { ...auth, config: { rateLimit: { max: 20, timeWindow: '15m' } } }, async (request, reply) => {
    const parsed = SaveBodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        message: parsed.error.errors[0]?.message ?? 'Validation error',
      })
    }
    const userId = getRequestUserId(request)
    try {
      const result = await app.container.ai.classify.save(userId, parsed.data.items)
      return reply.send(result)
    } catch (err) {
      app.log.error(err)
      return reply.status(500).send({ statusCode: 500, message: 'AI save failed' })
    }
  })
}
