export type InboxStatus = 'PENDING' | 'PROCESSED' | 'DISMISSED'

export interface InboxItemProps {
  id: string
  userId: string
  content: string
  status: InboxStatus
  createdAt: Date
  updatedAt: Date
}

export interface InboxItemDTO {
  id: string
  userId: string
  content: string
  status: InboxStatus
  createdAt: string
  updatedAt: string
}

export class InboxItem {
  private constructor(private readonly props: InboxItemProps) {}

  static reconstitute(props: InboxItemProps): InboxItem {
    return new InboxItem(props)
  }

  get id(): string { return this.props.id }
  get userId(): string { return this.props.userId }

  toDTO(): InboxItemDTO {
    return {
      id: this.props.id,
      userId: this.props.userId,
      content: this.props.content,
      status: this.props.status,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    }
  }
}
