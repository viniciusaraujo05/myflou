import type { ISubscriptionRepository } from '../../domain/subscription/subscription.repository.js'
import type { ISpaceRepository } from '../../domain/space/space.repository.js'
import type { SubscriptionDTO, BillingCycle } from '../../domain/subscription/subscription.entity.js'
import { InvalidRelationError, NotFoundError } from '../../domain/shared/domain-error.js'

export class UpdateSubscriptionUseCase {
  constructor(
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly spaceRepo: ISpaceRepository,
  ) {}
  async execute(input: {
    subscriptionId: string
    userId: string
    name?: string
    amount?: number
    billingCycle?: BillingCycle
    nextBillingDate?: string
    active?: boolean
    description?: string | null
    category?: string | null
    spaceId?: string | null
  }): Promise<SubscriptionDTO> {
    const existing = await this.subscriptionRepo.findById(input.subscriptionId)
    if (!existing || existing.userId !== input.userId) throw new NotFoundError('Subscription not found')
    if (input.spaceId) {
      const space = await this.spaceRepo.findById(input.spaceId)
      if (!space || space.userId !== input.userId) throw new InvalidRelationError('Space')
    }
    const s = await this.subscriptionRepo.update(input.subscriptionId, {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.amount !== undefined && { amount: input.amount }),
      ...(input.billingCycle !== undefined && { billingCycle: input.billingCycle }),
      ...(input.nextBillingDate !== undefined && { nextBillingDate: new Date(input.nextBillingDate) }),
      ...(input.active !== undefined && { active: input.active }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.category !== undefined && { category: input.category }),
      ...('spaceId' in input && { spaceId: input.spaceId ?? null }),
    })
    return s.toDTO()
  }
}
