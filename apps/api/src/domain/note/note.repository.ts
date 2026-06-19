import type { Note } from './note.entity.js'
export interface INotRepository {
  create(userId: string, title: string, folderId?: string | null, spaceId?: string | null): Promise<Note>
  findByUser(userId: string, folderId?: string | null, search?: string, spaceId?: string): Promise<Note[]>
  findById(id: string): Promise<Note | null>
  update(id: string, data: { title?: string; content?: unknown; folderId?: string | null; spaceId?: string | null }, userId: string): Promise<Note>
  delete(id: string, userId: string): Promise<void>
}
