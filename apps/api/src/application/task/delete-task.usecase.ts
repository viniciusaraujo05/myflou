import type { ITaskRepository } from '../../domain/task/task.repository.js'
import { TaskNotFoundError, TaskAccessDeniedError } from '../../domain/task/task.errors.js'

interface Input {
  taskId: string
  userId: string
}

export class DeleteTaskUseCase {
  constructor(private readonly taskRepo: ITaskRepository) {}

  async execute(input: Input): Promise<void> {
    const task = await this.taskRepo.findById(input.taskId)
    if (!task) throw new TaskNotFoundError()
    if (task.userId !== input.userId) throw new TaskAccessDeniedError()
    await this.taskRepo.delete(input.taskId)
  }
}
