import crypto from 'crypto'
import type { FastifyInstance } from 'fastify'
import type { ITokenService, TokenPayload } from '../../domain/auth/token.service.js'

export class JwtTokenService implements ITokenService {
  constructor(private readonly fastify: FastifyInstance) {}

  signAccessToken(payload: TokenPayload): string {
    return this.fastify.jwt.sign(payload, { expiresIn: '1h' })
  }

  verifyAccessToken(token: string): TokenPayload {
    return this.fastify.jwt.verify<TokenPayload>(token)
  }

  generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex')
  }
}
