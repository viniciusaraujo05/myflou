export type TransactionType = 'INCOME' | 'EXPENSE'
export type BillingCycle = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'

export interface Transaction {
  id: string
  userId: string
  spaceId: string | null
  type: TransactionType
  amount: number
  category: string
  description: string | null
  date: string       // YYYY-MM-DD
  createdAt: string
  updatedAt: string
}

export interface Subscription {
  id: string
  userId: string
  spaceId: string | null
  name: string
  amount: number
  billingCycle: BillingCycle
  nextBillingDate: string  // YYYY-MM-DD
  active: boolean
  description: string | null
  category: string | null
  createdAt: string
  updatedAt: string
}
