import type { Space } from './space.entity.js'

export interface ISpaceRepository {
  create(userId: string, data: { name: string; color?: string; icon?: string | null; order?: number }): Promise<Space>
  findByUser(userId: string): Promise<Space[]>
  findById(id: string): Promise<Space | null>
  update(id: string, data: { name?: string; color?: string; icon?: string | null; order?: number; archived?: boolean }, userId: string): Promise<Space>
  delete(id: string, userId: string): Promise<void>
  /** Create the default set of spaces for a brand-new account. No-op if any already exist. */
  seedDefaults(userId: string): Promise<void>
}
