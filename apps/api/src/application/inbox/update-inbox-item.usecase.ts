import type { IInboxItemRepository } from '../../domain/inbox/inbox-item.repository.js'
import type { InboxItemDTO, InboxStatus } from '../../domain/inbox/inbox-item.entity.js'
import { NotFoundError, AccessDeniedError } from '../../domain/shared/domain-error.js'

export class UpdateInboxItemUseCase {
  constructor(private readonly inboxRepo: IInboxItemRepository) {}

  async execute(input: { itemId: string; userId: string; status?: InboxStatus; content?: string }): Promise<InboxItemDTO> {
    const item = await this.inboxRepo.findById(input.itemId)
    if (!item) throw new NotFoundError('Inbox item')
    if (item.userId !== input.userId) throw new AccessDeniedError()

    const data: { status?: InboxStatus; content?: string } = {}
    if (input.status !== undefined) data.status = input.status
    if (input.content !== undefined) data.content = input.content.trim()

    const updated = await this.inboxRepo.update(input.itemId, data, input.userId)
    return updated.toDTO()
  }
}
