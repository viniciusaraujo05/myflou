import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { getRequestUserId } from '../request-user.js'

const TRANSACTION_TYPES = ['INCOME', 'EXPENSE'] as const

const CreateSchema = z.object({
  type: z.enum(TRANSACTION_TYPES),
  amount: z.number().positive(),
  category: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  spaceId: z.string().nullable().optional(),
})

const UpdateSchema = CreateSchema.partial()

const QuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  space: z.string().optional(),
})

export async function transactionRoutes(app: FastifyInstance) {
  const auth = { preHandler: [app.authenticate] }

  app.get('/', auth, async (request, reply) => {
    const userId = getRequestUserId(request)
    const query = QuerySchema.safeParse(request.query)
    const { space, ...filters } = query.success ? query.data : {}
    const list = await app.container.transaction.getTransactions.execute({ userId, ...filters, spaceId: space })
    return reply.send(list)
  })

  app.post('/', auth, async (request, reply) => {
    const parsed = CreateSchema.safeParse(request.body)
    if (!parsed.success) return reply.status(400).send({ statusCode: 400, message: parsed.error.issues[0]?.message ?? 'Validation error' })
    const userId = getRequestUserId(request)
    const t = await app.container.transaction.createTransaction.execute({ userId, ...parsed.data })
    return reply.status(201).send(t)
  })

  app.patch('/:id', auth, async (request, reply) => {
    const { id: transactionId } = request.params as { id: string }
    const parsed = UpdateSchema.safeParse(request.body)
    if (!parsed.success) return reply.status(400).send({ statusCode: 400, message: parsed.error.issues[0]?.message ?? 'Validation error' })
    const userId = getRequestUserId(request)
    const t = await app.container.transaction.updateTransaction.execute({ transactionId, userId, ...parsed.data })
    return reply.send(t)
  })

  app.delete('/:id', auth, async (request, reply) => {
    const { id: transactionId } = request.params as { id: string }
    const userId = getRequestUserId(request)
    await app.container.transaction.deleteTransaction.execute({ transactionId, userId })
    return reply.status(204).send()
  })
}
