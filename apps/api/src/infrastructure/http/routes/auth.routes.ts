import type { FastifyInstance } from 'fastify'
import { RegisterBodySchema, LoginBodySchema } from '../schemas/auth.http-schema.js'

const ACCESS_MAX_AGE = 15 * 60 // 15 minutes in seconds

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }
}

function refreshMaxAge(absoluteExpiresAt: Date): number {
  return Math.max(0, Math.floor((absoluteExpiresAt.getTime() - Date.now()) / 1000))
}

export async function authRoutes(app: FastifyInstance) {
  // POST /auth/register
  app.post(
    '/register',
    { config: { rateLimit: { max: 10, timeWindow: '1h' } } },
    async (request, reply) => {
      const parsed = RegisterBodySchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.status(400).send({
          statusCode: 400,
          message: parsed.error.issues[0]?.message ?? 'Validation error',
          code: 'VALIDATION_ERROR',
        })
      }

      const { user, tokenPair, absoluteExpiresAt } = await app.container.auth.register.execute(parsed.data)

      return reply
        .setCookie('access_token', tokenPair.accessToken, cookieOptions(ACCESS_MAX_AGE))
        .setCookie('refresh_token', tokenPair.refreshToken, cookieOptions(refreshMaxAge(absoluteExpiresAt)))
        .status(201)
        .send({ user })
    },
  )

  // POST /auth/login
  app.post(
    '/login',
    { config: { rateLimit: { max: 5, timeWindow: '15m' } } },
    async (request, reply) => {
      const parsed = LoginBodySchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.status(400).send({
          statusCode: 400,
          message: parsed.error.issues[0]?.message ?? 'Validation error',
          code: 'VALIDATION_ERROR',
        })
      }

      const { user, tokenPair, absoluteExpiresAt } = await app.container.auth.login.execute(parsed.data)

      return reply
        .setCookie('access_token', tokenPair.accessToken, cookieOptions(ACCESS_MAX_AGE))
        .setCookie('refresh_token', tokenPair.refreshToken, cookieOptions(refreshMaxAge(absoluteExpiresAt)))
        .send({ user })
    },
  )

  // POST /auth/refresh
  app.post('/refresh', { config: { rateLimit: { max: 10, timeWindow: '15m' } } }, async (request, reply) => {
    const rawRefreshToken = request.cookies?.refresh_token
    const { tokenPair, absoluteExpiresAt } = await app.container.auth.refresh.execute(rawRefreshToken)

    return reply
      .setCookie('access_token', tokenPair.accessToken, cookieOptions(ACCESS_MAX_AGE))
      .setCookie('refresh_token', tokenPair.refreshToken, cookieOptions(refreshMaxAge(absoluteExpiresAt)))
      .send({ ok: true })
  })

  // POST /auth/google — called by Next.js BFF after verifying Google tokens
  app.post('/google', { config: { rateLimit: { max: 10, timeWindow: '15m' } } }, async (request, reply) => {
    const { googleId, email, name } = request.body as { googleId: string; email: string; name?: string }
    if (!googleId || !email) {
      return reply.status(400).send({ statusCode: 400, message: 'googleId and email are required' })
    }

    const { user, tokenPair, absoluteExpiresAt } = await app.container.auth.googleLogin.execute({ googleId, email, name })

    return reply
      .setCookie('access_token', tokenPair.accessToken, cookieOptions(ACCESS_MAX_AGE))
      .setCookie('refresh_token', tokenPair.refreshToken, cookieOptions(refreshMaxAge(absoluteExpiresAt)))
      .send({ user })
  })

  // POST /auth/logout
  app.post('/logout', { config: { rateLimit: { max: 10, timeWindow: '15m' } } }, async (request, reply) => {
    const rawRefreshToken = request.cookies?.refresh_token
    await app.container.auth.logout.execute(rawRefreshToken)

    return reply
      .clearCookie('access_token', { path: '/' })
      .clearCookie('refresh_token', { path: '/' })
      .send({ ok: true })
  })
}
