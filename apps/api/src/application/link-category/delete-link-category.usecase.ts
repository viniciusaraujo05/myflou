import type { ILinkCategoryRepository } from '../../domain/link-category/link-category.repository.js'
import { NotFoundError } from '../../domain/shared/domain-error.js'

export class DeleteLinkCategoryUseCase {
  constructor(private readonly linkCategoryRepo: ILinkCategoryRepository) {}

  async execute(input: { categoryId: string; userId: string }): Promise<void> {
    const existing = await this.linkCategoryRepo.findById(input.categoryId)
    if (!existing || existing.userId !== input.userId) throw new NotFoundError('Link category')
    await this.linkCategoryRepo.delete(input.categoryId)
  }
}
