import type { ILinkCategoryRepository } from '../../domain/link-category/link-category.repository.js'
import type { LinkCategoryDTO } from '../../domain/link-category/link-category.entity.js'

export class GetLinkCategoriesUseCase {
  constructor(private readonly linkCategoryRepo: ILinkCategoryRepository) {}

  async execute(userId: string): Promise<LinkCategoryDTO[]> {
    const categories = await this.linkCategoryRepo.findByUser(userId)
    return categories.map(c => c.toDTO())
  }
}
