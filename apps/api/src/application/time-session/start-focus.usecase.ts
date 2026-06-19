import type { ITimeSessionRepository } from '../../domain/time-session/time-session.repository.js'
import type { ISpaceRepository } from '../../domain/space/space.repository.js'
import type { ITaskRepository } from '../../domain/task/task.repository.js'
import type { TimeSessionDTO } from '../../domain/time-session/time-session.entity.js'
import { InvalidRelationError } from '../../domain/shared/domain-error.js'

interface Input {
  userId: string
  spaceId?: string | null
  taskId?: string | null
  note?: string | null
}

export class StartFocusUseCase {
  constructor(
    private readonly sessionRepo: ITimeSessionRepository,
    private readonly spaceRepo: ISpaceRepository,
    private readonly taskRepo: ITaskRepository,
  ) {}

  async execute(input: Input): Promise<TimeSessionDTO> {
    if (input.spaceId) {
      const space = await this.spaceRepo.findById(input.spaceId)
      if (!space || space.userId !== input.userId) throw new InvalidRelationError('Space')
    }
    if (input.taskId) {
      const task = await this.taskRepo.findById(input.taskId)
      if (!task || task.userId !== input.userId) throw new InvalidRelationError('Task')
    }

    // Only one active session per user — stop any existing one first.
    const active = await this.sessionRepo.findActive(input.userId)
    if (active) {
      const endedAt = new Date()
      const durationSec = Math.max(0, Math.round((endedAt.getTime() - active.startedAt.getTime()) / 1000))
      await this.sessionRepo.stop(active.id, endedAt, durationSec, input.userId)
    }

    const session = await this.sessionRepo.create(input.userId, {
      spaceId: input.spaceId ?? null,
      taskId: input.taskId ?? null,
      note: input.note ?? null,
    })
    return session.toDTO()
  }
}
