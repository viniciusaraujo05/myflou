import fp from 'fastify-plugin'
import helmet from '@fastify/helmet'
import type { FastifyInstance } from 'fastify'

export const helmetPlugin = fp(async (app: FastifyInstance) => {
  await app.register(helmet, {
    // CSP is for HTML documents — this is a JSON API, so disable it.
    // The Next.js frontend owns the page-level CSP.
    contentSecurityPolicy: false,

    // COEP + COOP can break cross-origin OAuth redirects.
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
  })
})
