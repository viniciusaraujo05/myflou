import type { ITaskRepository } from '../../domain/task/task.repository.js'
import type { TaskDTO } from '../../domain/task/task.entity.js'

interface Input {
  userId: string
  from: string // YYYY-MM-DD
  to: string   // YYYY-MM-DD
  spaceId?: string
}

export class GetTasksUseCase {
  constructor(private readonly taskRepo: ITaskRepository) {}

  async execute(input: Input): Promise<TaskDTO[]> {
    const from = new Date(input.from + 'T00:00:00.000Z')
    const to = new Date(input.to + 'T23:59:59.999Z')
    const tasks = await this.taskRepo.findByUserAndDateRange(input.userId, from, to, input.spaceId)
    return tasks.map(t => t.toDTO())
  }
}
