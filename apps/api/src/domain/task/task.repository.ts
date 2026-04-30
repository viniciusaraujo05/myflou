import type { Task } from './task.entity.js'

export interface ITaskRepository {
  create(userId: string, title: string, date: Date, description?: string | null, hoursSpent?: number | null, statusId?: string | null): Promise<Task>
  findByUserAndDateRange(userId: string, from: Date, to: Date): Promise<Task[]>
  findById(id: string): Promise<Task | null>
  update(id: string, data: { title?: string; date?: Date; completed?: boolean; description?: string | null; hoursSpent?: number | null; statusId?: string | null }, userId: string): Promise<Task>
  delete(id: string, userId: string): Promise<void>
}
