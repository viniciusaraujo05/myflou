import type { PrismaClient, Prisma } from '@prisma/client'
import { ActivityEvent, type ActivityAction } from '../../domain/activity/activity-event.entity.js'
import type { IActivityEventRepository } from '../../domain/activity/activity-event.repository.js'
import type { ActivityInput } from '../../domain/activity/activity-recorder.js'
import type { ResourceType } from '../../domain/relation/resource-resolver.js'

export class PrismaActivityEventRepository implements IActivityEventRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: ActivityInput): Promise<void> {
    await this.prisma.activityEvent.create({
      data: {
        userId: input.userId,
        spaceId: input.spaceId ?? null,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        title: input.title,
        metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    })
  }

  async findByUser(userId: string, spaceId: string | undefined, limit: number): Promise<ActivityEvent[]> {
    const rows = await this.prisma.activityEvent.findMany({
      where: { userId, ...(spaceId !== undefined ? { spaceId } : {}) },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    return rows.map(r => ActivityEvent.reconstitute({
      id: r.id,
      userId: r.userId,
      spaceId: r.spaceId,
      action: r.action as ActivityAction,
      resourceType: r.resourceType as ResourceType,
      resourceId: r.resourceId,
      title: r.title,
      metadata: (r.metadata ?? null) as Record<string, unknown> | null,
      createdAt: r.createdAt,
    }))
  }
}
