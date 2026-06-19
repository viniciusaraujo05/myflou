export type BillingCycle = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'

export interface SubscriptionProps {
  id: string
  userId: string
  spaceId: string | null
  name: string
  amount: number
  billingCycle: BillingCycle
  nextBillingDate: Date
  active: boolean
  description: string | null
  category: string | null
  createdAt: Date
  updatedAt: Date
}

export interface SubscriptionDTO {
  id: string
  userId: string
  spaceId: string | null
  name: string
  amount: number
  billingCycle: BillingCycle
  nextBillingDate: string
  active: boolean
  description: string | null
  category: string | null
  createdAt: string
  updatedAt: string
}

export class Subscription {
  private constructor(private readonly props: SubscriptionProps) {}
  static reconstitute(props: SubscriptionProps) { return new Subscription(props) }
  get id() { return this.props.id }
  get userId() { return this.props.userId }
  get spaceId() { return this.props.spaceId }
  get name() { return this.props.name }
  get amount() { return this.props.amount }
  get billingCycle() { return this.props.billingCycle }
  get nextBillingDate() { return this.props.nextBillingDate }
  get active() { return this.props.active }
  get description() { return this.props.description }
  get category() { return this.props.category }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }
  toDTO(): SubscriptionDTO {
    return {
      id: this.props.id,
      userId: this.props.userId,
      spaceId: this.props.spaceId,
      name: this.props.name,
      amount: this.props.amount,
      billingCycle: this.props.billingCycle,
      nextBillingDate: this.props.nextBillingDate.toISOString().split('T')[0],
      active: this.props.active,
      description: this.props.description,
      category: this.props.category,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    }
  }
}
