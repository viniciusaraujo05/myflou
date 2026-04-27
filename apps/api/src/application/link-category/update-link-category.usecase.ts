import type { ILinkCategoryRepository } from '../../domain/link-category/link-category.repository.js'
import type { LinkCategoryDTO } from '../../domain/link-category/link-category.entity.js'
import { NotFoundError } from '../../domain/shared/domain-error.js'

interface Input {
  categoryId: string
  userId: string
  name?: string
  color?: string
}

export class UpdateLinkCategoryUseCase {
  constructor(private readonly linkCategoryRepo: ILinkCategoryRepository) {}

  async execute(input: Input): Promise<LinkCategoryDTO> {
    const existing = await this.linkCategoryRepo.findById(input.categoryId)
    if (!existing || existing.userId !== input.userId) throw new NotFoundError('Link category')

    const data: { name?: string; color?: string } = {}
    if (input.name !== undefined) data.name = input.name.trim()
    if (input.color !== undefined) data.color = input.color
    const category = await this.linkCategoryRepo.update(input.categoryId, data)
    return category.toDTO()
  }
}
