import type { IInboxItemRepository } from '../../domain/inbox/inbox-item.repository.js'
import { NotFoundError, AccessDeniedError } from '../../domain/shared/domain-error.js'

export class DeleteInboxItemUseCase {
  constructor(private readonly inboxRepo: IInboxItemRepository) {}

  async execute(input: { itemId: string; userId: string }): Promise<void> {
    const item = await this.inboxRepo.findById(input.itemId)
    if (!item) throw new NotFoundError('Inbox item')
    if (item.userId !== input.userId) throw new AccessDeniedError()
    await this.inboxRepo.delete(input.itemId, input.userId)
  }
}
