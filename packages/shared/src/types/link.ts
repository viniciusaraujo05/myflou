export interface Link {
  id: string
  userId: string
  categoryId: string | null
  title: string
  url: string
  description: string | null
  username: string | null
  password: string | null
  createdAt: string
  updatedAt: string
}
