import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'

const REQUIRED = ['DATABASE_URL', 'JWT_SECRET', 'COOKIE_SECRET', 'ENCRYPTION_KEY', 'OPENAI_API_KEY'] as const

export const envPlugin = fp(async (app: FastifyInstance) => {
  const missing = REQUIRED.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  const jwtSecret = process.env.JWT_SECRET!
  if (jwtSecret.length < 32) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be at least 32 characters — generate with: openssl rand -hex 32')
    }
    app.log.warn('JWT_SECRET is too short — generate with: openssl rand -hex 32')
  }

  const cookieSecret = process.env.COOKIE_SECRET!
  if (cookieSecret.length < 32) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('COOKIE_SECRET must be at least 32 characters — generate with: openssl rand -hex 32')
    }
    app.log.warn('COOKIE_SECRET is too short — generate with: openssl rand -hex 32')
  }

  const encryptionKey = process.env.ENCRYPTION_KEY!
  if (!/^[0-9a-fA-F]{64}$/.test(encryptionKey)) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string — generate with: openssl rand -hex 32')
  }

  if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) {
    throw new Error('CORS_ORIGIN must be configured in production')
  }
})
