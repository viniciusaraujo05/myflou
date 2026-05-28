import type { ITransactionRepository } from '../../domain/transaction/transaction.repository.js'
import { NotFoundError } from '../../domain/shared/domain-error.js'

export class DeleteTransactionUseCase {
  constructor(private readonly transactionRepo: ITransactionRepository) {}
  async execute(input: { transactionId: string; userId: string }): Promise<void> {
    const existing = await this.transactionRepo.findById(input.transactionId)
    if (!existing || existing.userId !== input.userId) throw new NotFoundError('Transaction not found')
    await this.transactionRepo.delete(input.transactionId)
  }
}
