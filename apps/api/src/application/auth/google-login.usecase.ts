import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { Email } from '../../domain/user/value-objects/email.vo.js'
import type { IUserRepository } from '../../domain/user/user.repository.js'
import type { ITokenService, TokenPair } from '../../domain/auth/token.service.js'
import type { IRefreshTokenRepository } from '../../domain/auth/refresh-token.repository.js'
import type { ISpaceRepository } from '../../domain/space/space.repository.js'
import type { UserDTO } from '../../domain/user/user.entity.js'

const REFRESH_TOKEN_SLIDING_TTL_MS  = 30  * 24 * 60 * 60 * 1000
const REFRESH_TOKEN_ABSOLUTE_TTL_MS = 180 * 24 * 60 * 60 * 1000

interface GoogleLoginInput {
  googleId: string
  email: string
  name?: string
}

interface GoogleLoginOutput {
  user: UserDTO
  tokenPair: TokenPair
  absoluteExpiresAt: Date
}

export class GoogleLoginUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly tokenService: ITokenService,
    private readonly refreshTokenRepo: IRefreshTokenRepository,
    private readonly spaceRepo: ISpaceRepository,
  ) {}

  async execute(input: GoogleLoginInput): Promise<GoogleLoginOutput> {
    let user = await this.userRepo.findByGoogleId(input.googleId)

    if (!user) {
      // Check if an account already exists with this email (link it)
      const existing = await this.userRepo.findByEmail(input.email.toLowerCase().trim())
      if (existing) {
        await this.userRepo.linkGoogleId(existing.id, input.googleId)
        user = await this.userRepo.findById(existing.id) as NonNullable<typeof user>
      } else {
        // Create a new account
        const email = Email.create(input.email)
        user = await this.userRepo.createWithGoogle(email, input.googleId)
        await this.spaceRepo.seedDefaults(user.id) // give the new account its default contexts
      }
    }

    await this.refreshTokenRepo.deleteExpired(new Date())

    const accessToken = this.tokenService.signAccessToken({ sub: user.id, email: user.email.value })
    const rawRefreshToken = this.tokenService.generateRefreshToken()
    const tokenPrefix = rawRefreshToken.slice(0, 16)
    const tokenHash = await bcrypt.hash(rawRefreshToken, 10)

    const family = randomUUID()
    const slidingExpiresAt  = new Date(Date.now() + REFRESH_TOKEN_SLIDING_TTL_MS)
    const absoluteExpiresAt = new Date(Date.now() + REFRESH_TOKEN_ABSOLUTE_TTL_MS)

    await this.refreshTokenRepo.create(user.id, tokenHash, tokenPrefix, slidingExpiresAt, absoluteExpiresAt, family)

    return {
      user: user.toDTO(),
      tokenPair: { accessToken, refreshToken: rawRefreshToken },
      absoluteExpiresAt,
    }
  }
}
