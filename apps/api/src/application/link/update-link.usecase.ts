import type { ILinkRepository } from '../../domain/link/link.repository.js'
import type { ILinkCategoryRepository } from '../../domain/link-category/link-category.repository.js'
import type { ISpaceRepository } from '../../domain/space/space.repository.js'
import type { LinkDTO } from '../../domain/link/link.entity.js'
import { InvalidRelationError, NotFoundError } from '../../domain/shared/domain-error.js'

interface Input {
  linkId: string
  userId: string
  title?: string
  url?: string
  description?: string | null
  username?: string | null
  password?: string | null
  categoryId?: string | null
  spaceId?: string | null
}

export class UpdateLinkUseCase {
  constructor(
    private readonly linkRepo: ILinkRepository,
    private readonly linkCategoryRepo: ILinkCategoryRepository,
    private readonly spaceRepo: ISpaceRepository,
  ) {}

  async execute(input: Input): Promise<LinkDTO> {
    const link = await this.linkRepo.findById(input.linkId)
    if (!link || link.userId !== input.userId) throw new NotFoundError('Link')

    if (input.categoryId) {
      const category = await this.linkCategoryRepo.findById(input.categoryId)
      if (!category || category.userId !== input.userId) throw new InvalidRelationError('Link category')
    }
    if (input.spaceId) {
      const space = await this.spaceRepo.findById(input.spaceId)
      if (!space || space.userId !== input.userId) throw new InvalidRelationError('Space')
    }

    const data: { title?: string; url?: string; description?: string | null; username?: string | null; password?: string | null; categoryId?: string | null; spaceId?: string | null } = {}
    if (input.title !== undefined) data.title = input.title
    if (input.url !== undefined) data.url = input.url
    if ('description' in input) data.description = input.description ?? null
    if ('username' in input) data.username = input.username ?? null
    if ('password' in input) data.password = input.password ?? null
    if ('categoryId' in input) data.categoryId = input.categoryId ?? null
    if ('spaceId' in input) data.spaceId = input.spaceId ?? null

    const updated = await this.linkRepo.update(input.linkId, data, input.userId)
    return updated.toDTO()
  }
}
