import type { PrismaClient } from '@prisma/client'
import { Task } from '../../domain/task/task.entity.js'
import type { ITaskRepository } from '../../domain/task/task.repository.js'

export class PrismaTaskRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(userId: string, title: string, date: Date, description?: string | null, hoursSpent?: number | null, statusId?: string | null): Promise<Task> {
    const record = await this.prisma.task.create({
      data: { userId, title, date, description, hoursSpent, statusId },
    })
    return this.toEntity(record)
  }

  async findByUserAndDateRange(userId: string, from: Date, to: Date): Promise<Task[]> {
    const records = await this.prisma.task.findMany({
      where: { userId, date: { gte: from, lte: to } },
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
    })
    return records.map(r => this.toEntity(r))
  }

  async findById(id: string): Promise<Task | null> {
    const record = await this.prisma.task.findUnique({ where: { id } })
    return record ? this.toEntity(record) : null
  }

  async update(id: string, data: { title?: string; date?: Date; completed?: boolean; description?: string | null; hoursSpent?: number | null; statusId?: string | null }): Promise<Task> {
    const record = await this.prisma.task.update({ where: { id }, data })
    return this.toEntity(record)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({ where: { id } })
  }

  private toEntity(record: {
    id: string
    userId: string
    title: string
    date: Date
    completed: boolean
    description: string | null
    hoursSpent: number | null
    statusId: string | null
    createdAt: Date
    updatedAt: Date
  }): Task {
    return Task.reconstitute({
      id: record.id,
      userId: record.userId,
      title: record.title,
      date: record.date,
      completed: record.completed,
      description: record.description,
      hoursSpent: record.hoursSpent,
      statusId: record.statusId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    })
  }
}
