import type { ITransactionRepository } from '../../domain/transaction/transaction.repository.js'
import type { ISpaceRepository } from '../../domain/space/space.repository.js'
import type { TransactionDTO, TransactionType } from '../../domain/transaction/transaction.entity.js'
import { InvalidRelationError, NotFoundError } from '../../domain/shared/domain-error.js'

export class UpdateTransactionUseCase {
  constructor(
    private readonly transactionRepo: ITransactionRepository,
    private readonly spaceRepo: ISpaceRepository,
  ) {}
  async execute(input: {
    transactionId: string
    userId: string
    type?: TransactionType
    amount?: number
    category?: string
    description?: string | null
    date?: string
    spaceId?: string | null
  }): Promise<TransactionDTO> {
    const existing = await this.transactionRepo.findById(input.transactionId)
    if (!existing || existing.userId !== input.userId) throw new NotFoundError('Transaction not found')
    if (input.spaceId) {
      const space = await this.spaceRepo.findById(input.spaceId)
      if (!space || space.userId !== input.userId) throw new InvalidRelationError('Space')
    }
    const t = await this.transactionRepo.update(input.transactionId, {
      ...(input.type !== undefined && { type: input.type }),
      ...(input.amount !== undefined && { amount: input.amount }),
      ...(input.category !== undefined && { category: input.category }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.date !== undefined && { date: new Date(input.date) }),
      ...('spaceId' in input && { spaceId: input.spaceId ?? null }),
    })
    return t.toDTO()
  }
}
