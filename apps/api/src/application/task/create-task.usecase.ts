import type { ITaskRepository } from '../../domain/task/task.repository.js'
import type { TaskDTO } from '../../domain/task/task.entity.js'

interface Input {
  userId: string
  title: string
  date: string // YYYY-MM-DD
  description?: string | null
  hoursSpent?: number | null
  statusId?: string | null
}

export class CreateTaskUseCase {
  constructor(private readonly taskRepo: ITaskRepository) {}

  async execute(input: Input): Promise<TaskDTO> {
    const date = new Date(input.date + 'T00:00:00.000Z')
    const task = await this.taskRepo.create(
      input.userId,
      input.title.trim(),
      date,
      input.description ?? null,
      input.hoursSpent ?? null,
      input.statusId ?? null,
    )
    return task.toDTO()
  }
}
