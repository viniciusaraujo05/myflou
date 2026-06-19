import type { ITransactionRepository } from '../../domain/transaction/transaction.repository.js'
import type { ISpaceRepository } from '../../domain/space/space.repository.js'
import type { IActivityRecorder } from '../../domain/activity/activity-recorder.js'
import type { TransactionDTO, TransactionType } from '../../domain/transaction/transaction.entity.js'
import { InvalidRelationError } from '../../domain/shared/domain-error.js'

export class CreateTransactionUseCase {
  constructor(
    private readonly transactionRepo: ITransactionRepository,
    private readonly spaceRepo: ISpaceRepository,
    private readonly activity: IActivityRecorder,
  ) {}
  async execute(input: {
    userId: string
    type: TransactionType
    amount: number
    category: string
    description?: string | null
    date: string
    spaceId?: string | null
  }): Promise<TransactionDTO> {
    if (input.spaceId) {
      const space = await this.spaceRepo.findById(input.spaceId)
      if (!space || space.userId !== input.userId) throw new InvalidRelationError('Space')
    }
    const t = await this.transactionRepo.create(input.userId, {
      type: input.type,
      amount: input.amount,
      category: input.category,
      description: input.description ?? null,
      date: new Date(input.date),
      spaceId: input.spaceId ?? null,
    })
    const dto = t.toDTO()
    await this.activity.record({ userId: input.userId, spaceId: dto.spaceId, action: 'CREATED', resourceType: 'TRANSACTION', resourceId: dto.id, title: `${dto.category} · ${dto.amount}` })
    return dto
  }
}
