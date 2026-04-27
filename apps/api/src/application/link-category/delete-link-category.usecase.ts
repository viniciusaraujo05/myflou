import type { ILinkCategoryRepository } from '../../domain/link-category/link-category.repository.js'

export class DeleteLinkCategoryUseCase {
  constructor(private readonly linkCategoryRepo: ILinkCategoryRepository) {}

  async execute(categoryId: string): Promise<void> {
    await this.linkCategoryRepo.delete(categoryId)
  }
}
