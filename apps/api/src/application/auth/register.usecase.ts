import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { Email } from '../../domain/user/value-objects/email.vo.js'
import { HashedPassword } from '../../domain/user/value-objects/password.vo.js'
import { EmailAlreadyInUseError } from '../../domain/user/user.errors.js'
import type { IUserRepository } from '../../domain/user/user.repository.js'
import type { ITokenService, TokenPair } from '../../domain/auth/token.service.js'
import type { IRefreshTokenRepository } from '../../domain/auth/refresh-token.repository.js'
import type { UserDTO } from '../../domain/user/user.entity.js'

const REFRESH_TOKEN_SLIDING_TTL_MS  = 30  * 24 * 60 * 60 * 1000  // 30 days
const REFRESH_TOKEN_ABSOLUTE_TTL_MS = 180 * 24 * 60 * 60 * 1000  // 6 months

interface RegisterInput {
  email: string
  password: string
}

interface RegisterOutput {
  user: UserDTO
  tokenPair: TokenPair
  absoluteExpiresAt: Date
}

export class RegisterUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly tokenService: ITokenService,
    private readonly refreshTokenRepo: IRefreshTokenRepository,
  ) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    const email = Email.create(input.email) // throws InvalidEmailError
    const password = await HashedPassword.fromPlain(input.password) // throws WeakPasswordError

    const existing = await this.userRepo.findByEmail(email.value)
    if (existing) throw new EmailAlreadyInUseError()

    const user = await this.userRepo.create(email, password)

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
