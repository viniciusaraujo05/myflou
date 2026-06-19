import type { IInboxItemRepository } from '../../domain/inbox/inbox-item.repository.js'
import type { InboxItemDTO, InboxStatus } from '../../domain/inbox/inbox-item.entity.js'

export class GetInboxItemsUseCase {
  constructor(private readonly inboxRepo: IInboxItemRepository) {}

  async execute(input: { userId: string; status?: InboxStatus }): Promise<InboxItemDTO[]> {
    const items = await this.inboxRepo.findByUser(input.userId, input.status)
    return items.map(i => i.toDTO())
  }
}
