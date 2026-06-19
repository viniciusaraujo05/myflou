import type { PrismaClient } from '@prisma/client'
import { TimeSession } from '../../domain/time-session/time-session.entity.js'
import type { ITimeSessionRepository } from '../../domain/time-session/time-session.repository.js'

type Row = {
  id: string; userId: string; spaceId: string | null; taskId: string | null
  note: string | null; startedAt: Date; endedAt: Date | null; durationSec: number | null
  createdAt: Date; updatedAt: Date
}

function toEntity(row: Row): TimeSession {
  return TimeSession.reconstitute({ ...row })
}

export class PrismaTimeSessionRepository implements ITimeSessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(userId: string, data: { spaceId?: string | null; taskId?: string | null; note?: string | null }): Promise<TimeSession> {
    const row = await this.prisma.timeSession.create({
      data: { userId, spaceId: data.spaceId ?? null, taskId: data.taskId ?? null, note: data.note ?? null },
    })
    return toEntity(row)
  }

  async findActive(userId: string): Promise<TimeSession | null> {
    const row = await this.prisma.timeSession.findFirst({
      where: { userId, endedAt: null },
      orderBy: { startedAt: 'desc' },
    })
    return row ? toEntity(row) : null
  }

  async stop(id: string, endedAt: Date, durationSec: number, userId: string): Promise<TimeSession> {
    await this.prisma.timeSession.updateMany({ where: { id, userId }, data: { endedAt, durationSec } })
    const row = await this.prisma.timeSession.findUniqueOrThrow({ where: { id } })
    return toEntity(row)
  }

  async findSince(userId: string, since: Date, spaceId?: string): Promise<TimeSession[]> {
    const rows = await this.prisma.timeSession.findMany({
      where: { userId, startedAt: { gte: since }, ...(spaceId !== undefined ? { spaceId } : {}) },
      orderBy: { startedAt: 'desc' },
    })
    return rows.map(toEntity)
  }
}
