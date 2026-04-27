import type { ITaskRepository } from '../../domain/task/task.repository.js'
import type { IUserRepository } from '../../domain/user/user.repository.js'
import type { TaskDTO } from '../../domain/task/task.entity.js'
import { InvalidRelationError } from '../../domain/shared/domain-error.js'
import { UserNotFoundError } from '../../domain/user/user.errors.js'

interface Input {
  userId: string
  title: string
  date: string // YYYY-MM-DD
  description?: string | null
  hoursSpent?: number | null
  statusId?: string | null
}

export class CreateTaskUseCase {
  constructor(
    private readonly taskRepo: ITaskRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(input: Input): Promise<TaskDTO> {
    const user = await this.userRepo.findById(input.userId)
    if (!user) throw new UserNotFoundError()
    if (input.statusId && !user.statuses.some(s => s.id === input.statusId)) {
      throw new InvalidRelationError('Status')
    }

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
