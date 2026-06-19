import type { ISubscriptionRepository } from '../../domain/subscription/subscription.repository.js'
import type { SubscriptionDTO } from '../../domain/subscription/subscription.entity.js'

export class GetSubscriptionsUseCase {
  constructor(private readonly subscriptionRepo: ISubscriptionRepository) {}
  async execute(input: { userId: string; spaceId?: string }): Promise<SubscriptionDTO[]> {
    const list = await this.subscriptionRepo.findByUserId(input.userId, input.spaceId)
    return list.map(s => s.toDTO())
  }
}
