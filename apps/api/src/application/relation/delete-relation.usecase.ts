import type { IResourceLinkRepository } from '../../domain/relation/resource-link.repository.js'
import { NotFoundError, AccessDeniedError } from '../../domain/shared/domain-error.js'

export class DeleteRelationUseCase {
  constructor(private readonly linkRepo: IResourceLinkRepository) {}

  async execute(input: { linkId: string; userId: string }): Promise<void> {
    const link = await this.linkRepo.findById(input.linkId)
    if (!link) throw new NotFoundError('Relation')
    if (link.userId !== input.userId) throw new AccessDeniedError()
    await this.linkRepo.delete(input.linkId, input.userId)
  }
}
