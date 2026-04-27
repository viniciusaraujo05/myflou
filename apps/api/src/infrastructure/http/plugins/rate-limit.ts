import fp from 'fastify-plugin'
import rateLimit from '@fastify/rate-limit'
import type { FastifyInstance } from 'fastify'

export const rateLimitPlugin = fp(async (app: FastifyInstance) => {
  await app.register(rateLimit, {
    global: true,
    max: 100,          // default: 100 req per window per IP
    timeWindow: 60000, // 1 minute
    // Future: swap store with Redis for multi-instance deployments
    // store: new RedisStore({ client: redisClient }),
    errorResponseBuilder: (_req, context) => ({
      statusCode: 429,
      message: `Too many requests — try again in ${Math.ceil((context as { ttl: number }).ttl / 1000)} seconds`,
    }),
  })
})
