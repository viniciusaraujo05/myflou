import bcrypt from 'bcryptjs'
import { InvalidTokenError, MissingTokenError } from '../../domain/auth/auth.errors.js'
import type { ITokenService, TokenPair } from '../../domain/auth/token.service.js'
import type { IRefreshTokenRepository, RefreshTokenRecord } from '../../domain/auth/refresh-token.repository.js'

const REFRESH_TOKEN_SLIDING_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

interface RefreshOutput {
  tokenPair: TokenPair
  absoluteExpiresAt: Date
}

export class RefreshUseCase {
  constructor(
    private readonly tokenService: ITokenService,
    private readonly refreshTokenRepo: IRefreshTokenRepository,
  ) {}

  async execute(rawRefreshToken: string | undefined): Promise<RefreshOutput> {
    if (!rawRefreshToken) throw new MissingTokenError()
    await this.refreshTokenRepo.deleteExpired(new Date())

    const prefix = rawRefreshToken.slice(0, 16)
    const candidates = await this.refreshTokenRepo.findByPrefix(prefix)
    const match = await this.findMatch(rawRefreshToken, candidates)

    if (!match) throw new InvalidTokenError()

    // Rotate: delete old token, issue new pair
    await this.refreshTokenRepo.deleteById(match.id)

    const accessToken = this.tokenService.signAccessToken({ sub: match.userId, email: match.userEmail })
    const newRawRefreshToken = this.tokenService.generateRefreshToken()
    const newTokenPrefix = newRawRefreshToken.slice(0, 16)
    const tokenHash = await bcrypt.hash(newRawRefreshToken, 10)

    // Sliding window: extend by 30 days, but never past the absolute ceiling
    const newExpiresAt = new Date(
      Math.min(Date.now() + REFRESH_TOKEN_SLIDING_TTL_MS, match.absoluteExpiresAt.getTime()),
    )

    await this.refreshTokenRepo.create(
      match.userId,
      tokenHash,
      newTokenPrefix,
      newExpiresAt,
      match.absoluteExpiresAt, // preserve absolute expiry from original login
      match.family,            // preserve family chain for theft detection
    )

    return {
      tokenPair: { accessToken, refreshToken: newRawRefreshToken },
      absoluteExpiresAt: match.absoluteExpiresAt,
    }
  }

  private async findMatch(
    raw: string,
    candidates: RefreshTokenRecord[],
  ): Promise<RefreshTokenRecord | null> {
    for (const candidate of candidates) {
      if (await bcrypt.compare(raw, candidate.tokenHash)) return candidate
    }
    return null
  }
}
