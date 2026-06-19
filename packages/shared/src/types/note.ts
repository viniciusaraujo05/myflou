export interface Note {
  id: string
  userId: string
  spaceId: string | null
  folderId: string | null
  title: string
  content?: unknown
  createdAt: string
  updatedAt: string
}

export interface NoteSummary {
  id: string
  userId: string
  spaceId: string | null
  folderId: string | null
  title: string
  createdAt: string
  updatedAt: string
}
