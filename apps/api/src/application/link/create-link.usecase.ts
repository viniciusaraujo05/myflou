import type { ILinkRepository } from '../../domain/link/link.repository.js'
import type { ILinkCategoryRepository } from '../../domain/link-category/link-category.repository.js'
import type { LinkDTO } from '../../domain/link/link.entity.js'
import { InvalidRelationError } from '../../domain/shared/domain-error.js'

interface Input {
  userId: string
  title: string
  url: string
  description?: string | null
  username?: string | null
  password?: string | null
  categoryId?: string | null
}

export class CreateLinkUseCase {
  constructor(
    private readonly linkRepo: ILinkRepository,
    private readonly linkCategoryRepo: ILinkCategoryRepository,
  ) {}

  async execute(input: Input): Promise<LinkDTO> {
    if (input.categoryId) {
      const category = await this.linkCategoryRepo.findById(input.categoryId)
      if (!category || category.userId !== input.userId) throw new InvalidRelationError('Link category')
    }
    const link = await this.linkRepo.create(input.userId, {
      title: input.title,
      url: input.url,
      description: input.description ?? null,
      username: input.username ?? null,
      password: input.password ?? null,
      categoryId: input.categoryId ?? null,
    })
    return link.toDTO()
  }
}
