import type { ITransactionRepository } from '../../domain/transaction/transaction.repository.js'
import type { TransactionDTO, TransactionType } from '../../domain/transaction/transaction.entity.js'
import { NotFoundError } from '../../domain/shared/domain-error.js'

export class UpdateTransactionUseCase {
  constructor(private readonly transactionRepo: ITransactionRepository) {}
  async execute(input: {
    transactionId: string
    userId: string
    type?: TransactionType
    amount?: number
    category?: string
    description?: string | null
    date?: string
  }): Promise<TransactionDTO> {
    const existing = await this.transactionRepo.findById(input.transactionId)
    if (!existing || existing.userId !== input.userId) throw new NotFoundError('Transaction not found')
    const t = await this.transactionRepo.update(input.transactionId, {
      ...(input.type !== undefined && { type: input.type }),
      ...(input.amount !== undefined && { amount: input.amount }),
      ...(input.category !== undefined && { category: input.category }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.date !== undefined && { date: new Date(input.date) }),
    })
    return t.toDTO()
  }
}
