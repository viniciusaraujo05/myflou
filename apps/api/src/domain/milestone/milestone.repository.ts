import type { Milestone, MilestoneStatus } from './milestone.entity.js'

export interface IMilestoneRepository {
  create(userId: string, data: { title: string; description?: string | null; status?: MilestoneStatus; targetDate?: Date | null; spaceId?: string | null; order?: number }): Promise<Milestone>
  findByUser(userId: string, spaceId?: string): Promise<Milestone[]>
  findById(id: string): Promise<Milestone | null>
  update(id: string, data: { title?: string; description?: string | null; status?: MilestoneStatus; targetDate?: Date | null; spaceId?: string | null; order?: number }, userId: string): Promise<Milestone>
  delete(id: string, userId: string): Promise<void>
}
