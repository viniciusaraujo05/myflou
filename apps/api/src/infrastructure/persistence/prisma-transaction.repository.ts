import type { PrismaClient } from '@prisma/client'
import { Transaction, type TransactionType } from '../../domain/transaction/transaction.entity.js'
import type { ITransactionRepository } from '../../domain/transaction/transaction.repository.js'

function toEntity(row: {
  id: string; userId: string; spaceId: string | null; type: string; amount: number
  category: string; description: string | null; date: Date
  createdAt: Date; updatedAt: Date
}): Transaction {
  return Transaction.reconstitute({
    id: row.id,
    userId: row.userId,
    spaceId: row.spaceId,
    type: row.type as TransactionType,
    amount: row.amount,
    category: row.category,
    description: row.description,
    date: row.date,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })
}

export class PrismaTransactionRepository implements ITransactionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(userId: string, data: { type: TransactionType; amount: number; category: string; description?: string | null; date: Date; spaceId?: string | null }) {
    const row = await this.prisma.transaction.create({ data: { userId, ...data, spaceId: data.spaceId ?? null } })
    return toEntity(row)
  }

  async findByUserId(userId: string, filters?: { from?: Date; to?: Date; spaceId?: string }) {
    const rows = await this.prisma.transaction.findMany({
      where: {
        userId,
        ...(filters?.spaceId !== undefined ? { spaceId: filters.spaceId } : {}),
        ...(filters?.from || filters?.to ? {
          date: {
            ...(filters.from ? { gte: filters.from } : {}),
            ...(filters.to ? { lte: filters.to } : {}),
          },
        } : {}),
      },
      orderBy: { date: 'desc' },
    })
    return rows.map(toEntity)
  }

  async findById(id: string) {
    const row = await this.prisma.transaction.findUnique({ where: { id } })
    return row ? toEntity(row) : null
  }

  async update(id: string, data: Partial<{ type: TransactionType; amount: number; category: string; description: string | null; date: Date; spaceId: string | null }>) {
    const row = await this.prisma.transaction.update({ where: { id }, data })
    return toEntity(row)
  }

  async delete(id: string) {
    await this.prisma.transaction.delete({ where: { id } })
  }
}
