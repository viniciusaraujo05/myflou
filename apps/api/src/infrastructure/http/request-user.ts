import type { FastifyRequest } from 'fastify'

export function getRequestUserId(request: FastifyRequest): string {
  const user = request.user
  if (!user || typeof user !== 'object' || !('sub' in user) || typeof user.sub !== 'string') {
    throw new Error('Authenticated user is missing')
  }
  return user.sub
}
