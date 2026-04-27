import fp from 'fastify-plugin'
import jwt from '@fastify/jwt'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

export const jwtPlugin = fp(async (app: FastifyInstance) => {
  await app.register(jwt, {
    secret: process.env.JWT_SECRET!,
    sign: { expiresIn: '15m' },
    // Read token from cookie first, then fall back to Authorization header
    cookie: {
      cookieName: 'access_token',
      signed: false,
    },
  })

  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify()
    } catch {
      reply.status(401).send({ statusCode: 401, message: 'Unauthorized' })
    }
  })
})

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}
