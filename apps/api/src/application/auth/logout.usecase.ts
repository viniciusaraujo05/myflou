import bcrypt from 'bcryptjs'
import type { IRefreshTokenRepository } from '../../domain/auth/refresh-token.repository.js'

export class LogoutUseCase {
  constructor(private readonly refreshTokenRepo: IRefreshTokenRepository) {}

  async execute(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) return // no-op if already logged out

    const prefix = rawRefreshToken.slice(0, 16)
    const candidates = await this.refreshTokenRepo.findByPrefix(prefix)

    for (const candidate of candidates) {
      const match = await bcrypt.compare(rawRefreshToken, candidate.tokenHash)
      if (match) {
        await this.refreshTokenRepo.deleteById(candidate.id)
        return
      }
    }
  }
}
