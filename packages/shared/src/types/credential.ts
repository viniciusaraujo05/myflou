export interface Credential {
  id: string
  userId: string
  spaceId: string | null
  service: string
  username: string
  password: string
  url: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}
