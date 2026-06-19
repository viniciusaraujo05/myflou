export type InboxStatus = 'PENDING' | 'PROCESSED' | 'DISMISSED'

export interface InboxItem {
  id: string
  userId: string
  content: string
  status: InboxStatus
  createdAt: string
  updatedAt: string
}
