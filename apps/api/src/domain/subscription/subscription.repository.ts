import type { Subscription, BillingCycle } from './subscription.entity.js'

export interface ISubscriptionRepository {
  create(userId: string, data: {
    name: string
    amount: number
    billingCycle: BillingCycle
    nextBillingDate: Date
    active?: boolean
    description?: string | null
    category?: string | null
  }): Promise<Subscription>
  findByUserId(userId: string): Promise<Subscription[]>
  findById(id: string): Promise<Subscription | null>
  update(id: string, data: Partial<{
    name: string
    amount: number
    billingCycle: BillingCycle
    nextBillingDate: Date
    active: boolean
    description: string | null
    category: string | null
  }>): Promise<Subscription>
  delete(id: string): Promise<void>
}
