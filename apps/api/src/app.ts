import Fastify from 'fastify'
import type { FastifyError } from 'fastify'
import { envPlugin } from './infrastructure/http/plugins/env.js'
import { helmetPlugin } from './infrastructure/http/plugins/helmet.js'
import { rateLimitPlugin } from './infrastructure/http/plugins/rate-limit.js'
import { corsPlugin } from './infrastructure/http/plugins/cors.js'
import { cookiePlugin } from './infrastructure/http/plugins/cookie.js'
import { jwtPlugin } from './infrastructure/http/plugins/jwt.js'
import { prismaPlugin } from './infrastructure/http/plugins/prisma.js'
import { containerPlugin } from './infrastructure/container/index.js'
import { registerRoutes } from './infrastructure/http/routes/index.js'

// DomainError.code → HTTP status code mapping
const DOMAIN_STATUS_MAP: Record<string, number> = {
  EMAIL_ALREADY_IN_USE: 409,
  INVALID_CREDENTIALS: 401,
  USER_NOT_FOUND: 404,
  INVALID_EMAIL: 400,
  WEAK_PASSWORD: 400,
  INVALID_TOKEN: 401,
  MISSING_TOKEN: 401,
  ACCOUNT_LOCKED: 429,
  TASK_NOT_FOUND: 404,
  TASK_ACCESS_DENIED: 403,
}

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
      transport:
        process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
    genReqId: () => crypto.randomUUID(),
  })

  // Register error handler FIRST — before plugins, so it's in scope for all child plugins
  app.setErrorHandler((error: FastifyError | Error, _request, reply) => {
    const code = (error as FastifyError).code ?? ''

    // DomainError — identified by its code being in the map
    if (code && Object.prototype.hasOwnProperty.call(DOMAIN_STATUS_MAP, code)) {
      const statusCode = DOMAIN_STATUS_MAP[code]!
      return reply.status(statusCode).send({ statusCode, message: error.message, code })
    }

    // Fastify built-in errors (validation, rate-limit, etc.)
    const fastifyStatus = (error as FastifyError).statusCode
    if (typeof fastifyStatus === 'number') {
      return reply.status(fastifyStatus).send({ statusCode: fastifyStatus, message: error.message })
    }

    app.log.error(error)
    return reply.status(500).send({ statusCode: 500, message: 'Internal server error' })
  })

  // Plugin order: env → helmet → rate-limit → cors → cookie → jwt → prisma → container → routes
  await app.register(envPlugin)
  await app.register(helmetPlugin)
  await app.register(rateLimitPlugin)
  await app.register(corsPlugin)
  await app.register(cookiePlugin)
  await app.register(jwtPlugin)
  await app.register(prismaPlugin)
  await app.register(containerPlugin)
  await app.register(registerRoutes)

  // Health check
  app.get('/health', { config: { rateLimit: { max: 500 } } }, async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }))

  return app
}
