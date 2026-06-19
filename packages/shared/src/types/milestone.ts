export type MilestoneStatus = 'PLANNED' | 'IN_PROGRESS' | 'DONE'

export interface Milestone {
  id: string
  userId: string
  spaceId: string | null
  title: string
  description: string | null
  status: MilestoneStatus
  targetDate: string | null // YYYY-MM-DD
  order: number
  taskCount: number
  completedCount: number
  createdAt: string
  updatedAt: string
}
