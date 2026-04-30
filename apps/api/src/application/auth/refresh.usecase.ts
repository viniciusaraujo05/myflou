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

    if (!match) {
      // Check for token replay: a previously rotated token being submitted
      // This is the signature of a stolen token — revoke the entire family
      const rotatedCandidates = await this.refreshTokenRepo.findRotatedByPrefix(prefix)
      const rotatedMatch = await this.findMatch(rawRefreshToken, rotatedCandidates)
      if (rotatedMatch) {
        await this.refreshTokenRepo.deleteAllByFamily(rotatedMatch.family)
      }
      throw new InvalidTokenError()
    }

    // Mark old token as rotated (kept briefly for theft detection) instead of hard-deleting
    await this.refreshTokenRepo.markAsRotated(match.id)

    const accessToken = this.tokenService.signAccessToken({ sub: match.userId, email: match.userEmail })
    const newRawRefreshToken = this.tokenService.generateRefreshToken()
    const newTokenPrefix = newRawRefreshToken.slice(0, 16)
    const tokenHash = await bcrypt.hash(newRawRefreshToken, 10)

    const newExpiresAt = new Date(
      Math.min(Date.now() + REFRESH_TOKEN_SLIDING_TTL_MS, match.absoluteExpiresAt.getTime()),
    )

    await this.refreshTokenRepo.create(
      match.userId,
      tokenHash,
      newTokenPrefix,
      newExpiresAt,
      match.absoluteExpiresAt,
      match.family,
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
