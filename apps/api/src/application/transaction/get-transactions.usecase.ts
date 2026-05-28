import type { ITransactionRepository } from '../../domain/transaction/transaction.repository.js'
import type { TransactionDTO } from '../../domain/transaction/transaction.entity.js'

export class GetTransactionsUseCase {
  constructor(private readonly transactionRepo: ITransactionRepository) {}
  async execute(input: { userId: string; from?: string; to?: string }): Promise<TransactionDTO[]> {
    const list = await this.transactionRepo.findByUserId(input.userId, {
      from: input.from ? new Date(input.from) : undefined,
      to: input.to ? new Date(input.to) : undefined,
    })
    return list.map(t => t.toDTO())
  }
}
