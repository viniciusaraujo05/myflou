import type { ITaskRepository } from '../../domain/task/task.repository.js'
import type { TaskDTO } from '../../domain/task/task.entity.js'
import { TaskNotFoundError, TaskAccessDeniedError } from '../../domain/task/task.errors.js'

interface Input {
  taskId: string
  userId: string
  title?: string
  date?: string  // YYYY-MM-DD
  completed?: boolean
  description?: string | null
  hoursSpent?: number | null
  statusId?: string | null
}

export class UpdateTaskUseCase {
  constructor(private readonly taskRepo: ITaskRepository) {}

  async execute(input: Input): Promise<TaskDTO> {
    const task = await this.taskRepo.findById(input.taskId)
    if (!task) throw new TaskNotFoundError()
    if (task.userId !== input.userId) throw new TaskAccessDeniedError()

    const data: {
      title?: string
      date?: Date
      completed?: boolean
      description?: string | null
      hoursSpent?: number | null
      statusId?: string | null
    } = {}

    if (input.title !== undefined) data.title = input.title.trim()
    if (input.date !== undefined) data.date = new Date(input.date + 'T00:00:00.000Z')
    if (input.completed !== undefined) data.completed = input.completed
    if ('description' in input) data.description = input.description ?? null
    if ('hoursSpent' in input) data.hoursSpent = input.hoursSpent ?? null
    if ('statusId' in input) data.statusId = input.statusId ?? null

    const updated = await this.taskRepo.update(input.taskId, data)
    return updated.toDTO()
  }
}
