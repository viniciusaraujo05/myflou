import bcrypt from 'bcryptjs'
import { InvalidCredentialsError, AccountLockedError } from '../../domain/auth/auth.errors.js'
import type { IUserRepository } from '../../domain/user/user.repository.js'
import type { ITokenService, TokenPair } from '../../domain/auth/token.service.js'
import type { IRefreshTokenRepository } from '../../domain/auth/refresh-token.repository.js'
import type { UserDTO } from '../../domain/user/user.entity.js'

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000 // 15 minutes

// Dummy hash used when user not found — prevents timing-based user enumeration
const DUMMY_HASH = '$2b$12$invalidhashtopreventtimingattacks0000000000000000000000'

interface LoginInput {
  email: string
  password: string
}

interface LoginOutput {
  user: UserDTO
  tokenPair: TokenPair
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

    const accessToken = this.tokenService.signAccessToken({ sub: user.id, email: user.email.value })
    const rawRefreshToken = this.tokenService.generateRefreshToken()
    const tokenPrefix = rawRefreshToken.slice(0, 16)
    const tokenHash = await bcrypt.hash(rawRefreshToken, 10)

    await this.refreshTokenRepo.create(
      user.id,
      tokenHash,
      tokenPrefix,
      new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    )

    return {
      user: user.toDTO(),
      tokenPair: { accessToken, refreshToken: rawRefreshToken },
    }
  }
}
