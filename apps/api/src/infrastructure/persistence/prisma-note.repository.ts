import type { PrismaClient } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { Note } from '../../domain/note/note.entity.js'
import type { INotRepository } from '../../domain/note/note.repository.js'

export class PrismaNoteRepository implements INotRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(userId: string, title: string, folderId?: string | null): Promise<Note> {
    const record = await this.prisma.note.create({
      data: { userId, title, folderId: folderId ?? null },
    })
    return this.toEntity(record)
  }

  async findByUser(userId: string, folderId?: string | null, search?: string): Promise<Note[]> {
    const where: Prisma.NoteWhereInput = { userId }
    if (folderId !== undefined) where.folderId = folderId
    if (search) where.title = { contains: search, mode: 'insensitive' }
    const records = await this.prisma.note.findMany({
      where,
      select: {
        id: true,
        userId: true,
        folderId: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    })
    return records.map(r => Note.reconstitute({ ...r, content: undefined }))
  }

  async findById(id: string): Promise<Note | null> {
    const record = await this.prisma.note.findUnique({ where: { id } })
    return record ? this.toEntity(record) : null
  }

  async update(id: string, data: { title?: string; content?: unknown; folderId?: string | null }, userId: string): Promise<Note> {
    const updateData: Prisma.NoteUncheckedUpdateInput = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.content !== undefined) updateData.content = data.content as Prisma.InputJsonValue
    if ('folderId' in data) updateData.folderId = data.folderId ?? null
    await this.prisma.note.updateMany({ where: { id, userId }, data: updateData })
    const record = await this.prisma.note.findUniqueOrThrow({ where: { id } })
    return this.toEntity(record)
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.prisma.note.deleteMany({ where: { id, userId } })
  }

  private toEntity(record: {
    id: string
    userId: string
    folderId: string | null
    title: string
    content?: unknown
    createdAt: Date
    updatedAt: Date
  }): Note {
    return Note.reconstitute({
      id: record.id,
      userId: record.userId,
      folderId: record.folderId,
      title: record.title,
      content: record.content,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    })
  }
}
