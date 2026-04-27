import type { FastifyInstance } from 'fastify'
import { getRequestUserId } from '../request-user.js'

export async function userRoutes(app: FastifyInstance) {
  // GET /users/me — JWT required (cookie or Authorization header)
  app.get(
    '/me',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const user = await app.container.user.getMe.execute(getRequestUserId(request))
      return reply.send(user)
    },
  )
}
