import bcrypt from 'bcryptjs'
import { InvalidTokenError, MissingTokenError } from '../../domain/auth/auth.errors.js'
import type { ITokenService, TokenPair } from '../../domain/auth/token.service.js'
import type { IRefreshTokenRepository, RefreshTokenRecord } from '../../domain/auth/refresh-token.repository.js'

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000

interface RefreshOutput {
  tokenPair: TokenPair
}

export class RefreshUseCase {
  constructor(
    private readonly tokenService: ITokenService,
    private readonly refreshTokenRepo: IRefreshTokenRepository,
  ) {}

  async execute(rawRefreshToken: string | undefined): Promise<RefreshOutput> {
    if (!rawRefreshToken) throw new MissingTokenError()

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

    await this.refreshTokenRepo.create(
      match.userId,
      tokenHash,
      newTokenPrefix,
      new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    )

    return { tokenPair: { accessToken, refreshToken: newRawRefreshToken } }
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
