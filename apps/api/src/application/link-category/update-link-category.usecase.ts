import type { ILinkCategoryRepository } from '../../domain/link-category/link-category.repository.js'
import type { ISpaceRepository } from '../../domain/space/space.repository.js'
import type { LinkCategoryDTO } from '../../domain/link-category/link-category.entity.js'
import { InvalidRelationError, NotFoundError } from '../../domain/shared/domain-error.js'

interface Input {
  categoryId: string
  userId: string
  name?: string
  color?: string
  spaceId?: string | null
}

export class UpdateLinkCategoryUseCase {
  constructor(
    private readonly linkCategoryRepo: ILinkCategoryRepository,
    private readonly spaceRepo: ISpaceRepository,
  ) {}

  async execute(input: Input): Promise<LinkCategoryDTO> {
    const existing = await this.linkCategoryRepo.findById(input.categoryId)
    if (!existing || existing.userId !== input.userId) throw new NotFoundError('Link category')
    if (input.spaceId) {
      const space = await this.spaceRepo.findById(input.spaceId)
      if (!space || space.userId !== input.userId) throw new InvalidRelationError('Space')
    }

    const data: { name?: string; color?: string; spaceId?: string | null } = {}
    if (input.name !== undefined) data.name = input.name.trim()
    if (input.color !== undefined) data.color = input.color
    if ('spaceId' in input) data.spaceId = input.spaceId ?? null
    const category = await this.linkCategoryRepo.update(input.categoryId, data, input.userId)
    return category.toDTO()
  }
}
