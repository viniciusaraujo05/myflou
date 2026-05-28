import type { ITransactionRepository } from '../../domain/transaction/transaction.repository.js'
import type { TransactionDTO, TransactionType } from '../../domain/transaction/transaction.entity.js'

export class CreateTransactionUseCase {
  constructor(private readonly transactionRepo: ITransactionRepository) {}
  async execute(input: {
    userId: string
    type: TransactionType
    amount: number
    category: string
    description?: string | null
    date: string
  }): Promise<TransactionDTO> {
    const t = await this.transactionRepo.create(input.userId, {
      type: input.type,
      amount: input.amount,
      category: input.category,
      description: input.description ?? null,
      date: new Date(input.date),
    })
    return t.toDTO()
  }
}
