import type { Transaction, TransactionType } from './transaction.entity.js'

export interface ITransactionRepository {
  create(userId: string, data: {
    type: TransactionType
    amount: number
    category: string
    description?: string | null
    date: Date
    spaceId?: string | null
  }): Promise<Transaction>
  findByUserId(userId: string, filters?: { from?: Date; to?: Date; spaceId?: string }): Promise<Transaction[]>
  findById(id: string): Promise<Transaction | null>
  update(id: string, data: Partial<{
    type: TransactionType
    amount: number
    category: string
    description: string | null
    date: Date
    spaceId: string | null
  }>): Promise<Transaction>
  delete(id: string): Promise<void>
}
