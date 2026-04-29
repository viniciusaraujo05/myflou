import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { InvalidCredentialsError, AccountLockedError } from '../../domain/auth/auth.errors.js'
import type { IUserRepository } from '../../domain/user/user.repository.js'
import type { ITokenService, TokenPair } from '../../domain/auth/token.service.js'
import type { IRefreshTokenRepository } from '../../domain/auth/refresh-token.repository.js'
import type { UserDTO } from '../../domain/user/user.entity.js'

const REFRESH_TOKEN_SLIDING_TTL_MS  = 30  * 24 * 60 * 60 * 1000  // 30 days
const REFRESH_TOKEN_ABSOLUTE_TTL_MS = 180 * 24 * 60 * 60 * 1000  // 6 months
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes

// Dummy hash used when user not found — prevents timing-based user enumeration
const DUMMY_HASH = '$2a$12$w/0X8.oeDgImyUsl5T0W7evS1Nm6i9ow9s16X7xFWh5V8KieWZZs.'

interface LoginInput {
  email: string
  password: string
}

interface LoginOutput {
  user: UserDTO
  tokenPair: TokenPair
  absoluteExpiresAt: Date
}

export class LoginUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly tokenService: ITokenService,
    private readonly refreshTokenRepo: IRefreshTokenRepository,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.userRepo.findByEmail(input.email.toLowerCase().trim())

    // Check account lockout before running bcrypt (fast path)
    if (user?.lockedUntil && user.lockedUntil > new Date()) {
      throw new AccountLockedError(user.lockedUntil)
    }

    // Always run bcrypt — even if user not found — to prevent timing attacks
    const hashToCompare = user?.password.value ?? DUMMY_HASH
    const valid = await bcrypt.compare(input.password, hashToCompare)

    if (!user || !valid) {
      // Track failed attempts per account when the user exists
      if (user) {
        const nextCount = user.failedLoginAttempts + 1
        const lockedUntil = nextCount >= MAX_FAILED_ATTEMPTS
          ? new Date(Date.now() + LOCKOUT_DURATION_MS)
          : null
        await this.userRepo.incrementFailedAttempts(user.id, lockedUntil)
      }
      throw new InvalidCredentialsError()
    }

    // Successful login — clear failed attempts counter
    await this.userRepo.resetFailedAttempts(user.id)
    await this.refreshTokenRepo.deleteExpired(new Date())

    const accessToken = this.tokenService.signAccessToken({ sub: user.id, email: user.email.value })
    const rawRefreshToken = this.tokenService.generateRefreshToken()
    const tokenPrefix = rawRefreshToken.slice(0, 16)
    const tokenHash = await bcrypt.hash(rawRefreshToken, 10)

    const family = randomUUID()
    const slidingExpiresAt   = new Date(Date.now() + REFRESH_TOKEN_SLIDING_TTL_MS)
    const absoluteExpiresAt  = new Date(Date.now() + REFRESH_TOKEN_ABSOLUTE_TTL_MS)

    await this.refreshTokenRepo.create(user.id, tokenHash, tokenPrefix, slidingExpiresAt, absoluteExpiresAt, family)

    return {
      user: user.toDTO(),
      tokenPair: { accessToken, refreshToken: rawRefreshToken },
      absoluteExpiresAt,
    }
  }
}
