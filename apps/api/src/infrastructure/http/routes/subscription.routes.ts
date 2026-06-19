import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { getRequestUserId } from '../request-user.js'

const BILLING_CYCLES = ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'] as const

const CreateSchema = z.object({
  name: z.string().min(1).max(200),
  amount: z.number().positive(),
  billingCycle: z.enum(BILLING_CYCLES),
  nextBillingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  active: z.boolean().optional(),
  description: z.string().max(500).nullable().optional(),
  category: z.string().max(100).nullable().optional(),
  spaceId: z.string().nullable().optional(),
})

const UpdateSchema = CreateSchema.partial()
const GetQuerySchema = z.object({ space: z.string().optional() })

export async function subscriptionRoutes(app: FastifyInstance) {
  const auth = { preHandler: [app.authenticate] }

  app.get('/', auth, async (request, reply) => {
    const userId = getRequestUserId(request)
    const query = GetQuerySchema.safeParse(request.query)
    const space = query.success ? query.data.space : undefined
    const list = await app.container.subscription.getSubscriptions.execute({ userId, spaceId: space })
    return reply.send(list)
  })

  app.post('/', auth, async (request, reply) => {
    const parsed = CreateSchema.safeParse(request.body)
    if (!parsed.success) return reply.status(400).send({ statusCode: 400, message: parsed.error.issues[0]?.message ?? 'Validation error' })
    const userId = getRequestUserId(request)
    const s = await app.container.subscription.createSubscription.execute({ userId, ...parsed.data })
    return reply.status(201).send(s)
  })

  app.patch('/:id', auth, async (request, reply) => {
    const { id: subscriptionId } = request.params as { id: string }
    const parsed = UpdateSchema.safeParse(request.body)
    if (!parsed.success) return reply.status(400).send({ statusCode: 400, message: parsed.error.issues[0]?.message ?? 'Validation error' })
    const userId = getRequestUserId(request)
    const s = await app.container.subscription.updateSubscription.execute({ subscriptionId, userId, ...parsed.data })
    return reply.send(s)
  })

  app.delete('/:id', auth, async (request, reply) => {
    const { id: subscriptionId } = request.params as { id: string }
    const userId = getRequestUserId(request)
    await app.container.subscription.deleteSubscription.execute({ subscriptionId, userId })
    return reply.status(204).send()
  })
}
