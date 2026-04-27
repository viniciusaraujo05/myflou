import type { PrismaClient } from '@prisma/client'
import type { IRefreshTokenRepository, RefreshTokenRecord } from '../../domain/auth/refresh-token.repository.js'

export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(userId: string, tokenHash: string, tokenPrefix: string, expiresAt: Date): Promise<void> {
    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, tokenPrefix, expiresAt },
    })
  }

  async findByPrefix(prefix: string): Promise<RefreshTokenRecord[]> {
    const records = await this.prisma.refreshToken.findMany({
      where: { tokenPrefix: prefix, expiresAt: { gt: new Date() } },
      include: { user: { select: { email: true } } },
    })

    return records.map((r) => ({
      id: r.id,
      tokenHash: r.tokenHash,
      userId: r.userId,
      userEmail: r.user.email,
      expiresAt: r.expiresAt,
    }))
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.refreshToken.delete({ where: { id } })
  }

  async deleteExpired(now: Date): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { expiresAt: { lte: now } } })
  }
}
