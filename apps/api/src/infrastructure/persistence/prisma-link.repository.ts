import type { PrismaClient } from '@prisma/client'
import { Link } from '../../domain/link/link.entity.js'
import type { ILinkRepository } from '../../domain/link/link.repository.js'
import { encrypt, decrypt } from '../crypto/encryption.service.js'

type LinkRow = {
  id: string; userId: string; categoryId: string | null
  title: string; url: string; description: string | null
  username: string | null; password: string | null
  createdAt: Date; updatedAt: Date
}

/** Encrypt a nullable string field — null stays null. */
function enc(v: string | null | undefined): string | null {
  if (v == null || v === '') return v ?? null
  return encrypt(v)
}

/** Decrypt a nullable string field — null/non-encrypted values pass through. */
function dec(v: string | null): string | null {
  return v == null ? null : decrypt(v)
}

function toEntity(r: LinkRow): Link {
  return Link.reconstitute({
    ...r,
    username: dec(r.username),
    password: dec(r.password),
  })
}

export class PrismaLinkRepository implements ILinkRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(userId: string, data: { title: string; url: string; description?: string | null; username?: string | null; password?: string | null; categoryId?: string | null }): Promise<Link> {
    const record = await this.prisma.link.create({
      data: {
        userId,
        title: data.title,
        url: data.url,
        description: data.description ?? null,
        username: enc(data.username),
        password: enc(data.password),
        categoryId: data.categoryId ?? null,
      },
    })
    return toEntity(record)
  }

  async findByUser(userId: string, categoryId?: string | null): Promise<Link[]> {
    const where: { userId: string; categoryId?: string | null } = { userId }
    if (categoryId !== undefined) where.categoryId = categoryId
    const records = await this.prisma.link.findMany({ where, orderBy: { createdAt: 'desc' } })
    return records.map(r => toEntity(r))
  }

  async findById(id: string): Promise<Link | null> {
    const record = await this.prisma.link.findUnique({ where: { id } })
    return record ? toEntity(record) : null
  }

  async update(id: string, data: { title?: string; url?: string; description?: string | null; username?: string | null; password?: string | null; categoryId?: string | null }, userId: string): Promise<Link> {
    const patch: Record<string, unknown> = { ...data }
    if ('username' in data) patch.username = enc(data.username)
    if ('password' in data) patch.password = enc(data.password)
    await this.prisma.link.updateMany({ where: { id, userId }, data: patch })
    const record = await this.prisma.link.findUniqueOrThrow({ where: { id } })
    return toEntity(record)
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.prisma.link.deleteMany({ where: { id, userId } })
  }
}
