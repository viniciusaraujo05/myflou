import type { LinkCategory } from './link-category.entity.js'
export interface ILinkCategoryRepository {
  create(userId: string, name: string, color: string): Promise<LinkCategory>
  findByUser(userId: string): Promise<LinkCategory[]>
  findById(id: string): Promise<LinkCategory | null>
  update(id: string, data: { name?: string; color?: string }): Promise<LinkCategory>
  delete(id: string): Promise<void>
}
