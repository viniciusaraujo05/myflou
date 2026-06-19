export interface Folder {
  id: string
  userId: string
  spaceId: string | null
  name: string
  color: string
  noteCount?: number
  createdAt: string
  updatedAt: string
}
