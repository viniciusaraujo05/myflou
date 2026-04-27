import type { PrismaClient } from '@prisma/client'
import { LinkCategory } from '../../domain/link-category/link-category.entity.js'
import type { ILinkCategoryRepository } from '../../domain/link-category/link-category.repository.js'

export class PrismaLinkCategoryRepository implements ILinkCategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(userId: string, name: string, color: string): Promise<LinkCategory> {
    const record = await this.prisma.linkCategory.create({ data: { userId, name, color } })
    return this.toEntity(record)
  }

  async findByUser(userId: string): Promise<LinkCategory[]> {
    const records = await this.prisma.linkCategory.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    })
    return records.map(r => this.toEntity(r))
  }

  async findById(id: string): Promise<LinkCategory | null> {
    const record = await this.prisma.linkCategory.findUnique({ where: { id } })
    return record ? this.toEntity(record) : null
  }

  async update(id: string, data: { name?: string; color?: string }): Promise<LinkCategory> {
    const record = await this.prisma.linkCategory.update({ where: { id }, data })
    return this.toEntity(record)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.linkCategory.delete({ where: { id } })
  }

  private toEntity(record: {
    id: string
    userId: string
    name: string
    color: string
    createdAt: Date
    updatedAt: Date
  }): LinkCategory {
    return LinkCategory.reconstitute({
      id: record.id,
      userId: record.userId,
      name: record.name,
      color: record.color,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    })
  }
}
