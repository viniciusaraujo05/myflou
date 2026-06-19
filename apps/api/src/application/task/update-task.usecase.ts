import type { ITaskRepository } from '../../domain/task/task.repository.js'
import type { IUserRepository } from '../../domain/user/user.repository.js'
import type { ISpaceRepository } from '../../domain/space/space.repository.js'
import type { IMilestoneRepository } from '../../domain/milestone/milestone.repository.js'
import type { IActivityRecorder } from '../../domain/activity/activity-recorder.js'
import type { TaskDTO } from '../../domain/task/task.entity.js'
import { TaskNotFoundError, TaskAccessDeniedError } from '../../domain/task/task.errors.js'
import { InvalidRelationError } from '../../domain/shared/domain-error.js'

interface Input {
  taskId: string
  userId: string
  title?: string
  date?: string  // YYYY-MM-DD
  completed?: boolean
  description?: string | null
  hoursSpent?: number | null
  statusId?: string | null
  spaceId?: string | null
  milestoneId?: string | null
}

export class UpdateTaskUseCase {
  constructor(
    private readonly taskRepo: ITaskRepository,
    private readonly userRepo: IUserRepository,
    private readonly spaceRepo: ISpaceRepository,
    private readonly milestoneRepo: IMilestoneRepository,
    private readonly activity: IActivityRecorder,
  ) {}

  async execute(input: Input): Promise<TaskDTO> {
    const task = await this.taskRepo.findById(input.taskId)
    if (!task) throw new TaskNotFoundError()
    if (task.userId !== input.userId) throw new TaskAccessDeniedError()
    if (input.statusId) {
      const user = await this.userRepo.findById(input.userId)
      if (!user || !user.statuses.some(s => s.id === input.statusId)) {
        throw new InvalidRelationError('Status')
      }
    }
    if (input.spaceId) {
      const space = await this.spaceRepo.findById(input.spaceId)
      if (!space || space.userId !== input.userId) throw new InvalidRelationError('Space')
    }
    if (input.milestoneId) {
      const milestone = await this.milestoneRepo.findById(input.milestoneId)
      if (!milestone || milestone.userId !== input.userId) throw new InvalidRelationError('Milestone')
    }

    const data: {
      title?: string
      date?: Date
      completed?: boolean
      description?: string | null
      hoursSpent?: number | null
      statusId?: string | null
      spaceId?: string | null
      milestoneId?: string | null
    } = {}

    if (input.title !== undefined) data.title = input.title.trim()
    if (input.date !== undefined) data.date = new Date(input.date + 'T00:00:00.000Z')
    if (input.completed !== undefined) data.completed = input.completed
    if ('description' in input) data.description = input.description ?? null
    if ('hoursSpent' in input) data.hoursSpent = input.hoursSpent ?? null
    if ('statusId' in input) data.statusId = input.statusId ?? null
    if ('spaceId' in input) data.spaceId = input.spaceId ?? null
    if ('milestoneId' in input) data.milestoneId = input.milestoneId ?? null

    const updated = await this.taskRepo.update(input.taskId, data, input.userId)
    if (input.completed === true && !task.completed) {
      await this.activity.record({ userId: input.userId, spaceId: updated.spaceId, action: 'COMPLETED', resourceType: 'TASK', resourceId: updated.id, title: updated.title })
    }
    return updated.toDTO()
  }
}
