import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { getRequestUserId } from '../request-user.js'

const UpdateProfileBody = z.object({
  name: z.string().max(100).nullable(),
})

const ChangePasswordBody = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(1),
})

export async function userRoutes(app: FastifyInstance) {
  app.get(
    '/me',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const user = await app.container.user.getMe.execute(getRequestUserId(request))
      return reply.send(user)
    },
  )

  app.patch(
    '/me',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = UpdateProfileBody.safeParse(request.body)
      if (!parsed.success) {
        return reply.status(400).send({ message: parsed.error.issues[0]?.message ?? 'Invalid body' })
      }
      const user = await app.container.user.updateProfile.execute({
        userId: getRequestUserId(request),
        name: parsed.data.name,
      })
      return reply.send(user)
    },
  )

  app.patch(
    '/me/password',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const parsed = ChangePasswordBody.safeParse(request.body)
      if (!parsed.success) {
        return reply.status(400).send({ message: parsed.error.issues[0]?.message ?? 'Invalid body' })
      }
      await app.container.user.changePassword.execute({
        userId: getRequestUserId(request),
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
      })
      return reply.status(204).send()
    },
  )
}
