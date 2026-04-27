import fp from 'fastify-plugin'
import helmet from '@fastify/helmet'
import type { FastifyInstance } from 'fastify'

export const helmetPlugin = fp(async (app: FastifyInstance) => {
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: { policy: 'require-corp' },
  })
})
