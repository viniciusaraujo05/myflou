import type { PrismaClient } from '@prisma/client'
import { Milestone, type MilestoneStatus } from '../../domain/milestone/milestone.entity.js'
import type { IMilestoneRepository } from '../../domain/milestone/milestone.repository.js'

type Row = {
  id: string
  userId: string
  spaceId: string | null
  title: string
  description: string | null
  status: string
  targetDate: Date | null
  order: number
  createdAt: Date
  updatedAt: Date
  tasks?: { completed: boolean }[]
}

function toEntity(row: Row): Milestone {
  const tasks = row.tasks ?? []
  return Milestone.reconstitute({
    id: row.id,
    userId: row.userId,
    spaceId: row.spaceId,
    title: row.title,
    description: row.description,
    status: row.status as MilestoneStatus,
    targetDate: row.targetDate,
    order: row.order,
    taskCount: tasks.length,
    completedCount: tasks.filter(t => t.completed).length,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })
}

const WITH_TASKS = { tasks: { select: { completed: true } } }

export class PrismaMilestoneRepository implements IMilestoneRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(userId: string, data: { title: string; description?: string | null; status?: MilestoneStatus; targetDate?: Date | null; spaceId?: string | null; order?: number }): Promise<Milestone> {
    const record = await this.prisma.milestone.create({
      data: {
        userId,
        title: data.title,
        description: data.description ?? null,
        ...(data.status !== undefined ? { status: data.status } : {}),
        targetDate: data.targetDate ?? null,
        spaceId: data.spaceId ?? null,
        ...(data.order !== undefined ? { order: data.order } : {}),
      },
      include: WITH_TASKS,
    })
    return toEntity(record)
  }

  async findByUser(userId: string, spaceId?: string): Promise<Milestone[]> {
    const records = await this.prisma.milestone.findMany({
      where: { userId, ...(spaceId !== undefined ? { spaceId } : {}) },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      include: WITH_TASKS,
    })
    return records.map(toEntity)
  }

  async findById(id: string): Promise<Milestone | null> {
    const record = await this.prisma.milestone.findUnique({ where: { id }, include: WITH_TASKS })
    return record ? toEntity(record) : null
  }

  async update(id: string, data: { title?: string; description?: string | null; status?: MilestoneStatus; targetDate?: Date | null; spaceId?: string | null; order?: number }, userId: string): Promise<Milestone> {
    await this.prisma.milestone.updateMany({ where: { id, userId }, data })
    const record = await this.prisma.milestone.findUniqueOrThrow({ where: { id }, include: WITH_TASKS })
    return toEntity(record)
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.prisma.milestone.deleteMany({ where: { id, userId } })
  }
}
