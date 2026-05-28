import type { ISubscriptionRepository } from '../../domain/subscription/subscription.repository.js'
import { NotFoundError } from '../../domain/shared/domain-error.js'

export class DeleteSubscriptionUseCase {
  constructor(private readonly subscriptionRepo: ISubscriptionRepository) {}
  async execute(input: { subscriptionId: string; userId: string }): Promise<void> {
    const existing = await this.subscriptionRepo.findById(input.subscriptionId)
    if (!existing || existing.userId !== input.userId) throw new NotFoundError('Subscription not found')
    await this.subscriptionRepo.delete(input.subscriptionId)
  }
}
