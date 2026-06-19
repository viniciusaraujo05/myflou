import type { LinkCategory } from './link-category.entity.js'
export interface ILinkCategoryRepository {
  create(userId: string, name: string, color: string, spaceId?: string | null): Promise<LinkCategory>
  findByUser(userId: string, spaceId?: string): Promise<LinkCategory[]>
  findById(id: string): Promise<LinkCategory | null>
  update(id: string, data: { name?: string; color?: string; spaceId?: string | null }, userId: string): Promise<LinkCategory>
  delete(id: string, userId: string): Promise<void>
}
