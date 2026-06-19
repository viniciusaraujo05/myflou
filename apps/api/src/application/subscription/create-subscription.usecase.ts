import type { ISubscriptionRepository } from '../../domain/subscription/subscription.repository.js'
import type { ISpaceRepository } from '../../domain/space/space.repository.js'
import type { IActivityRecorder } from '../../domain/activity/activity-recorder.js'
import type { SubscriptionDTO, BillingCycle } from '../../domain/subscription/subscription.entity.js'
import { InvalidRelationError } from '../../domain/shared/domain-error.js'

export class CreateSubscriptionUseCase {
  constructor(
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly spaceRepo: ISpaceRepository,
    private readonly activity: IActivityRecorder,
  ) {}
  async execute(input: {
    userId: string
    name: string
    amount: number
    billingCycle: BillingCycle
    nextBillingDate: string
    active?: boolean
    description?: string | null
    category?: string | null
    spaceId?: string | null
  }): Promise<SubscriptionDTO> {
    if (input.spaceId) {
      const space = await this.spaceRepo.findById(input.spaceId)
      if (!space || space.userId !== input.userId) throw new InvalidRelationError('Space')
    }
    const s = await this.subscriptionRepo.create(input.userId, {
      name: input.name,
      amount: input.amount,
      billingCycle: input.billingCycle,
      nextBillingDate: new Date(input.nextBillingDate),
      active: input.active ?? true,
      description: input.description ?? null,
      category: input.category ?? null,
      spaceId: input.spaceId ?? null,
    })
    const dto = s.toDTO()
    await this.activity.record({ userId: input.userId, spaceId: dto.spaceId, action: 'CREATED', resourceType: 'SUBSCRIPTION', resourceId: dto.id, title: dto.name })
    return dto
  }
}
