import type { InboxItem, InboxStatus } from './inbox-item.entity.js'

export interface IInboxItemRepository {
  create(userId: string, content: string): Promise<InboxItem>
  findByUser(userId: string, status?: InboxStatus): Promise<InboxItem[]>
  findById(id: string): Promise<InboxItem | null>
  update(id: string, data: { status?: InboxStatus; content?: string }, userId: string): Promise<InboxItem>
  delete(id: string, userId: string): Promise<void>
}
