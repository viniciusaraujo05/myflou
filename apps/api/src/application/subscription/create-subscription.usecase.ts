import type { ISubscriptionRepository } from '../../domain/subscription/subscription.repository.js'
import type { SubscriptionDTO, BillingCycle } from '../../domain/subscription/subscription.entity.js'

export class CreateSubscriptionUseCase {
  constructor(private readonly subscriptionRepo: ISubscriptionRepository) {}
  async execute(input: {
    userId: string
    name: string
    amount: number
    billingCycle: BillingCycle
    nextBillingDate: string
    active?: boolean
    description?: string | null
    category?: string | null
  }): Promise<SubscriptionDTO> {
    const s = await this.subscriptionRepo.create(input.userId, {
      name: input.name,
      amount: input.amount,
      billingCycle: input.billingCycle,
      nextBillingDate: new Date(input.nextBillingDate),
      active: input.active ?? true,
      description: input.description ?? null,
      category: input.category ?? null,
    })
    return s.toDTO()
  }
}
