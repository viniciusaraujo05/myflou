import type { IInboxItemRepository } from '../../domain/inbox/inbox-item.repository.js'
import type { InboxItemDTO } from '../../domain/inbox/inbox-item.entity.js'

export class CreateInboxItemUseCase {
  constructor(private readonly inboxRepo: IInboxItemRepository) {}

  async execute(input: { userId: string; content: string }): Promise<InboxItemDTO> {
    const item = await this.inboxRepo.create(input.userId, input.content.trim())
    return item.toDTO()
  }
}
