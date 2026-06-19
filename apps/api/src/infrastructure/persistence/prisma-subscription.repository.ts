import type { PrismaClient } from '@prisma/client'
import { Subscription, type BillingCycle } from '../../domain/subscription/subscription.entity.js'
import type { ISubscriptionRepository } from '../../domain/subscription/subscription.repository.js'

function toEntity(row: {
  id: string; userId: string; spaceId: string | null; name: string; amount: number
  billingCycle: string; nextBillingDate: Date; active: boolean
  description: string | null; category: string | null
  createdAt: Date; updatedAt: Date
}): Subscription {
  return Subscription.reconstitute({
    id: row.id,
    userId: row.userId,
    spaceId: row.spaceId,
    name: row.name,
    amount: row.amount,
    billingCycle: row.billingCycle as BillingCycle,
    nextBillingDate: row.nextBillingDate,
    active: row.active,
    description: row.description,
    category: row.category,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })
}

export class PrismaSubscriptionRepository implements ISubscriptionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(userId: string, data: { name: string; amount: number; billingCycle: BillingCycle; nextBillingDate: Date; active?: boolean; description?: string | null; category?: string | null; spaceId?: string | null }) {
    const row = await this.prisma.subscription.create({ data: { userId, ...data, spaceId: data.spaceId ?? null } })
    return toEntity(row)
  }

  async findByUserId(userId: string, spaceId?: string) {
    const rows = await this.prisma.subscription.findMany({
      where: { userId, ...(spaceId !== undefined ? { spaceId } : {}) },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map(toEntity)
  }

  async findById(id: string) {
    const row = await this.prisma.subscription.findUnique({ where: { id } })
    return row ? toEntity(row) : null
  }

  async update(id: string, data: Partial<{ name: string; amount: number; billingCycle: BillingCycle; nextBillingDate: Date; active: boolean; description: string | null; category: string | null; spaceId: string | null }>) {
    const row = await this.prisma.subscription.update({ where: { id }, data })
    return toEntity(row)
  }

  async delete(id: string) {
    await this.prisma.subscription.delete({ where: { id } })
  }
}
