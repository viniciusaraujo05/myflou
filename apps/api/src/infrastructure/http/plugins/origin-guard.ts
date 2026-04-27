import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

function normalizeOrigin(origin: string): string | null {
  try {
    return new URL(origin).origin
  } catch {
    return null
  }
}

export const originGuardPlugin = fp(async (app: FastifyInstance) => {
  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map(origin => normalizeOrigin(origin.trim()))
    .filter((origin): origin is string => Boolean(origin))

  app.addHook('onRequest', async (request, reply) => {
    if (!WRITE_METHODS.has(request.method)) return

    const origin = request.headers.origin
    if (!origin) return

    const normalized = normalizeOrigin(origin)
    if (!normalized || !allowedOrigins.includes(normalized)) {
      return reply.status(403).send({ statusCode: 403, message: 'Forbidden origin' })
    }
  })
})
