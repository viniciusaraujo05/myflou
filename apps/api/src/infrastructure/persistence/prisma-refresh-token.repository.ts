import type { PrismaClient } from '@prisma/client'
import type { IRefreshTokenRepository, RefreshTokenRecord } from '../../domain/auth/refresh-token.repository.js'

export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(
    userId: string,
    tokenHash: string,
    tokenPrefix: string,
    expiresAt: Date,
    absoluteExpiresAt: Date,
    family: string,
  ): Promise<void> {
    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, tokenPrefix, expiresAt, absoluteExpiresAt, family },
    })
  }

  async findByPrefix(prefix: string): Promise<RefreshTokenRecord[]> {
    const now = new Date()
    const records = await this.prisma.refreshToken.findMany({
      where: {
        tokenPrefix: prefix,
        rotated: false,
        expiresAt: { gt: now },
        absoluteExpiresAt: { gt: now },
      },
      include: { user: { select: { email: true } } },
    })
    return records.map(this.toRecord)
  }

  async findRotatedByPrefix(prefix: string): Promise<RefreshTokenRecord[]> {
    const cutoff = new Date(Date.now() - 60 * 60 * 1000) // tokens rotated within the last hour
    const records = await this.prisma.refreshToken.findMany({
      where: {
        tokenPrefix: prefix,
        rotated: true,
        rotatedAt: { gt: cutoff },
      },
      include: { user: { select: { email: true } } },
    })
    return records.map(this.toRecord)
  }

  async markAsRotated(id: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id },
      data: { rotated: true, rotatedAt: new Date() },
    })
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.refreshToken.delete({ where: { id } })
  }

  async deleteExpired(now: Date): Promise<void> {
    const rotatedCutoff = new Date(now.getTime() - 60 * 60 * 1000)
    await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lte: now } },
          { absoluteExpiresAt: { lte: now } },
          { rotated: true, rotatedAt: { lte: rotatedCutoff } },
        ],
      },
    })
  }

  async deleteAllByFamily(family: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { family } })
  }

  private toRecord(r: {
    id: string
    tokenHash: string
    userId: string
    expiresAt: Date
    absoluteExpiresAt: Date
    family: string
    user: { email: string }
  }): RefreshTokenRecord {
    return {
      id: r.id,
      tokenHash: r.tokenHash,
      userId: r.userId,
      userEmail: r.user.email,
      expiresAt: r.expiresAt,
      absoluteExpiresAt: r.absoluteExpiresAt,
      family: r.family,
    }
  }
}
