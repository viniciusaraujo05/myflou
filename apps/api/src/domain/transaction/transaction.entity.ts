export type TransactionType = 'INCOME' | 'EXPENSE'

export interface TransactionProps {
  id: string
  userId: string
  spaceId: string | null
  type: TransactionType
  amount: number
  category: string
  description: string | null
  date: Date
  createdAt: Date
  updatedAt: Date
}

export interface TransactionDTO {
  id: string
  userId: string
  spaceId: string | null
  type: TransactionType
  amount: number
  category: string
  description: string | null
  date: string
  createdAt: string
  updatedAt: string
}

export class Transaction {
  private constructor(private readonly props: TransactionProps) {}
  static reconstitute(props: TransactionProps) { return new Transaction(props) }
  get id() { return this.props.id }
  get userId() { return this.props.userId }
  get spaceId() { return this.props.spaceId }
  get type() { return this.props.type }
  get amount() { return this.props.amount }
  get category() { return this.props.category }
  get description() { return this.props.description }
  get date() { return this.props.date }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }
  toDTO(): TransactionDTO {
    return {
      id: this.props.id,
      userId: this.props.userId,
      spaceId: this.props.spaceId,
      type: this.props.type,
      amount: this.props.amount,
      category: this.props.category,
      description: this.props.description,
      date: this.props.date.toISOString().split('T')[0],
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    }
  }
}
