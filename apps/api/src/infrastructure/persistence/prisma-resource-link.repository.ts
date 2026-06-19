import type { PrismaClient } from '@prisma/client'
import { ResourceLink } from '../../domain/relation/resource-link.entity.js'
import type { IResourceLinkRepository } from '../../domain/relation/resource-link.repository.js'
import type { ResourceType } from '../../domain/relation/resource-resolver.js'

type Row = { id: string; userId: string; fromType: string; fromId: string; toType: string; toId: string; createdAt: Date }

function toEntity(row: Row): ResourceLink {
  return ResourceLink.reconstitute({
    id: row.id,
    userId: row.userId,
    fromType: row.fromType as ResourceType,
    fromId: row.fromId,
    toType: row.toType as ResourceType,
    toId: row.toId,
    createdAt: row.createdAt,
  })
}

export class PrismaResourceLinkRepository implements IResourceLinkRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(userId: string, fromType: ResourceType, fromId: string, toType: ResourceType, toId: string): Promise<ResourceLink> {
    const row = await this.prisma.resourceLink.create({ data: { userId, fromType, fromId, toType, toId } })
    return toEntity(row)
  }

  async findPair(userId: string, fromType: ResourceType, fromId: string, toType: ResourceType, toId: string): Promise<ResourceLink | null> {
    const row = await this.prisma.resourceLink.findFirst({ where: { userId, fromType, fromId, toType, toId } })
    return row ? toEntity(row) : null
  }

  async findForResource(userId: string, type: ResourceType, id: string): Promise<ResourceLink[]> {
    const rows = await this.prisma.resourceLink.findMany({
      where: { userId, OR: [{ fromType: type, fromId: id }, { toType: type, toId: id }] },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map(toEntity)
  }

  async findById(id: string): Promise<ResourceLink | null> {
    const row = await this.prisma.resourceLink.findUnique({ where: { id } })
    return row ? toEntity(row) : null
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.prisma.resourceLink.deleteMany({ where: { id, userId } })
  }
}
