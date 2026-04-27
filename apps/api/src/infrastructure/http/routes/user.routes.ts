import type { FastifyInstance } from 'fastify'

export async function userRoutes(app: FastifyInstance) {
  // GET /users/me — JWT required (cookie or Authorization header)
  app.get(
    '/me',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const payload = request.user as { sub: string }
      const user = await app.container.user.getMe.execute(payload.sub)
      return reply.send(user)
    },
  )
}
