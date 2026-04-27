export interface Task {
  id: string
  userId: string
  title: string
  date: string       // YYYY-MM-DD
  completed: boolean
  description: string | null
  hoursSpent: number | null
  statusId: string | null
  createdAt: string
  updatedAt: string
}
