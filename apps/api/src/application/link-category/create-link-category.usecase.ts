import type { ILinkCategoryRepository } from '../../domain/link-category/link-category.repository.js'
import type { LinkCategoryDTO } from '../../domain/link-category/link-category.entity.js'

interface Input {
  userId: string
  name: string
  color: string
}

export class CreateLinkCategoryUseCase {
  constructor(private readonly linkCategoryRepo: ILinkCategoryRepository) {}

  async execute(input: Input): Promise<LinkCategoryDTO> {
    const category = await this.linkCategoryRepo.create(input.userId, input.name.trim(), input.color)
    return category.toDTO()
  }
}
