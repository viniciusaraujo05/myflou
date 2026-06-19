import type { PrismaClient } from '@prisma/client'
import { Space } from '../../domain/space/space.entity.js'
import type { ISpaceRepository } from '../../domain/space/space.repository.js'

/** The default contexts seeded for every new account, in display order. */
const DEFAULT_SPACES: Array<{ name: string; color: string }> = [
  { name: 'Personal', color: '#6366f1' },
  { name: 'Work', color: '#0ea5e9' },
  { name: 'DOCSET', color: '#f59e0b' },
  { name: 'Nerdora', color: '#ec4899' },
  { name: 'Cliniartico', color: '#10b981' },
  { name: 'Axians', color: '#ef4444' },
  { name: 'Church', color: '#8b5cf6' },
]

export class PrismaSpaceRepository implements ISpaceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(userId: string, data: { name: string; color?: string; icon?: string | null; order?: number }): Promise<Space> {
    const record = await this.prisma.space.create({
      data: {
        userId,
        name: data.name,
        ...(data.color !== undefined ? { color: data.color } : {}),
        icon: data.icon ?? null,
        ...(data.order !== undefined ? { order: data.order } : {}),
      },
    })
    return this.toEntity(record)
  }

  async findByUser(userId: string): Promise<Space[]> {
    const records = await this.prisma.space.findMany({
      where: { userId },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    })
    return records.map(r => this.toEntity(r))
  }

  async findById(id: string): Promise<Space | null> {
    const record = await this.prisma.space.findUnique({ where: { id } })
    return record ? this.toEntity(record) : null
  }

  async update(id: string, data: { name?: string; color?: string; icon?: string | null; order?: number; archived?: boolean }, userId: string): Promise<Space> {
    await this.prisma.space.updateMany({ where: { id, userId }, data })
    const record = await this.prisma.space.findUniqueOrThrow({ where: { id } })
    return this.toEntity(record)
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.prisma.space.deleteMany({ where: { id, userId } })
  }

  async seedDefaults(userId: string): Promise<void> {
    const existing = await this.prisma.space.count({ where: { userId } })
    if (existing > 0) return
    await this.prisma.space.createMany({
      data: DEFAULT_SPACES.map((s, i) => ({ userId, name: s.name, color: s.color, order: i })),
    })
  }

  private toEntity(record: {
    id: string
    userId: string
    name: string
    color: string
    icon: string | null
    order: number
    archived: boolean
    createdAt: Date
    updatedAt: Date
  }): Space {
    return Space.reconstitute({
      id: record.id,
      userId: record.userId,
      name: record.name,
      color: record.color,
      icon: record.icon,
      order: record.order,
      archived: record.archived,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    })
  }
}
