export interface Space {
  id: string
  userId: string
  name: string
  color: string
  icon: string | null
  order: number
  archived: boolean
  createdAt: string
  updatedAt: string
}
