import type { PrismaClient } from '@prisma/client'
import { Folder } from '../../domain/folder/folder.entity.js'
import type { IFolderRepository } from '../../domain/folder/folder.repository.js'

export class PrismaFolderRepository implements IFolderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(userId: string, name: string, color: string): Promise<Folder> {
    const record = await this.prisma.folder.create({ data: { userId, name, color } })
    return this.toEntity(record)
  }

  async findByUser(userId: string): Promise<Folder[]> {
    const records = await this.prisma.folder.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    })
    return records.map(r => this.toEntity(r))
  }

  async findById(id: string): Promise<Folder | null> {
    const record = await this.prisma.folder.findUnique({ where: { id } })
    return record ? this.toEntity(record) : null
  }

  async update(id: string, data: { name?: string; color?: string }, userId: string): Promise<Folder> {
    await this.prisma.folder.updateMany({ where: { id, userId }, data })
    const record = await this.prisma.folder.findUniqueOrThrow({ where: { id } })
    return this.toEntity(record)
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.prisma.folder.deleteMany({ where: { id, userId } })
  }

  private toEntity(record: {
    id: string
    userId: string
    name: string
    color: string
    createdAt: Date
    updatedAt: Date
  }): Folder {
    return Folder.reconstitute({
      id: record.id,
      userId: record.userId,
      name: record.name,
      color: record.color,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    })
  }
}
