import type { Link } from './link.entity.js'
export interface ILinkRepository {
  create(userId: string, data: { title: string; url: string; description?: string | null; username?: string | null; password?: string | null; categoryId?: string | null }): Promise<Link>
  findByUser(userId: string, categoryId?: string | null): Promise<Link[]>
  findById(id: string): Promise<Link | null>
  update(id: string, data: { title?: string; url?: string; description?: string | null; username?: string | null; password?: string | null; categoryId?: string | null }, userId: string): Promise<Link>
  delete(id: string, userId: string): Promise<void>
}
