export interface Note {
  id: string
  userId: string
  folderId: string | null
  title: string
  content?: unknown
  createdAt: string
  updatedAt: string
}

export interface NoteSummary {
  id: string
  userId: string
  folderId: string | null
  title: string
  createdAt: string
  updatedAt: string
}
