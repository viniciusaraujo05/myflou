import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { getRequestUserId } from '../request-user.js'

const CreateSchema = z.object({
  service: z.string().min(1).max(200),
  username: z.string().min(1).max(500),
  password: z.string().min(1).max(1000),
  url: z.string().url().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
})

const UpdateSchema = CreateSchema.partial()

export async function credentialRoutes(app: FastifyInstance) {
  const auth = { preHandler: [app.authenticate] }

  app.get('/', auth, async (request, reply) => {
    const userId = getRequestUserId(request)
    const list = await app.container.credential.getCredentials.execute({ userId })
    return reply.send(list)
  })

  app.post('/', auth, async (request, reply) => {
    const parsed = CreateSchema.safeParse(request.body)
    if (!parsed.success) return reply.status(400).send({ statusCode: 400, message: parsed.error.issues[0]?.message ?? 'Validation error' })
    const userId = getRequestUserId(request)
    const c = await app.container.credential.createCredential.execute({ userId, ...parsed.data })
    return reply.status(201).send(c)
  })

  app.patch('/:id', auth, async (request, reply) => {
    const { id: credentialId } = request.params as { id: string }
    const parsed = UpdateSchema.safeParse(request.body)
    if (!parsed.success) return reply.status(400).send({ statusCode: 400, message: parsed.error.issues[0]?.message ?? 'Validation error' })
    const userId = getRequestUserId(request)
    const c = await app.container.credential.updateCredential.execute({ credentialId, userId, ...parsed.data })
    return reply.send(c)
  })

  app.delete('/:id', auth, async (request, reply) => {
    const { id: credentialId } = request.params as { id: string }
    const userId = getRequestUserId(request)
    await app.container.credential.deleteCredential.execute({ credentialId, userId })
    return reply.status(204).send()
  })
}
