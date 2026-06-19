import type { PrismaClient } from '@prisma/client'
import { InboxItem, type InboxStatus } from '../../domain/inbox/inbox-item.entity.js'
import type { IInboxItemRepository } from '../../domain/inbox/inbox-item.repository.js'

function toEntity(row: { id: string; userId: string; content: string; status: string; createdAt: Date; updatedAt: Date }): InboxItem {
  return InboxItem.reconstitute({
    id: row.id,
    userId: row.userId,
    content: row.content,
    status: row.status as InboxStatus,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })
}

export class PrismaInboxItemRepository implements IInboxItemRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(userId: string, content: string): Promise<InboxItem> {
    const row = await this.prisma.inboxItem.create({ data: { userId, content } })
    return toEntity(row)
  }

  async findByUser(userId: string, status?: InboxStatus): Promise<InboxItem[]> {
    const rows = await this.prisma.inboxItem.findMany({
      where: { userId, ...(status !== undefined ? { status } : {}) },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map(toEntity)
  }

  async findById(id: string): Promise<InboxItem | null> {
    const row = await this.prisma.inboxItem.findUnique({ where: { id } })
    return row ? toEntity(row) : null
  }

  async update(id: string, data: { status?: InboxStatus; content?: string }, userId: string): Promise<InboxItem> {
    await this.prisma.inboxItem.updateMany({ where: { id, userId }, data })
    const row = await this.prisma.inboxItem.findUniqueOrThrow({ where: { id } })
    return toEntity(row)
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.prisma.inboxItem.deleteMany({ where: { id, userId } })
  }
}
