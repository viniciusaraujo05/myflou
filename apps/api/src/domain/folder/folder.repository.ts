import type { Folder } from './folder.entity.js'
export interface IFolderRepository {
  create(userId: string, name: string, color: string): Promise<Folder>
  findByUser(userId: string): Promise<Folder[]>
  findById(id: string): Promise<Folder | null>
  update(id: string, data: { name?: string; color?: string }): Promise<Folder>
  delete(id: string): Promise<void>
}
