import type { ILinkCategoryRepository } from '../../domain/link-category/link-category.repository.js'
import type { ISpaceRepository } from '../../domain/space/space.repository.js'
import type { LinkCategoryDTO } from '../../domain/link-category/link-category.entity.js'
import { InvalidRelationError } from '../../domain/shared/domain-error.js'

interface Input {
  userId: string
  name: string
  color: string
  spaceId?: string | null
}

export class CreateLinkCategoryUseCase {
  constructor(
    private readonly linkCategoryRepo: ILinkCategoryRepository,
    private readonly spaceRepo: ISpaceRepository,
  ) {}

  async execute(input: Input): Promise<LinkCategoryDTO> {
    if (input.spaceId) {
      const space = await this.spaceRepo.findById(input.spaceId)
      if (!space || space.userId !== input.userId) throw new InvalidRelationError('Space')
    }
    const category = await this.linkCategoryRepo.create(input.userId, input.name.trim(), input.color, input.spaceId ?? null)
    return category.toDTO()
  }
}
