import type { IMilestoneRepository } from '../../domain/milestone/milestone.repository.js'
import type { ISpaceRepository } from '../../domain/space/space.repository.js'
import type { IActivityRecorder } from '../../domain/activity/activity-recorder.js'
import type { MilestoneDTO, MilestoneStatus } from '../../domain/milestone/milestone.entity.js'
import { MilestoneNotFoundError, MilestoneAccessDeniedError } from '../../domain/milestone/milestone.errors.js'
import { InvalidRelationError } from '../../domain/shared/domain-error.js'

interface Input {
  milestoneId: string
  userId: string
  title?: string
  description?: string | null
  status?: MilestoneStatus
  targetDate?: string | null
  spaceId?: string | null
  order?: number
}

export class UpdateMilestoneUseCase {
  constructor(
    private readonly milestoneRepo: IMilestoneRepository,
    private readonly spaceRepo: ISpaceRepository,
    private readonly activity: IActivityRecorder,
  ) {}

  async execute(input: Input): Promise<MilestoneDTO> {
    const milestone = await this.milestoneRepo.findById(input.milestoneId)
    if (!milestone) throw new MilestoneNotFoundError()
    if (milestone.userId !== input.userId) throw new MilestoneAccessDeniedError()
    if (input.spaceId) {
      const space = await this.spaceRepo.findById(input.spaceId)
      if (!space || space.userId !== input.userId) throw new InvalidRelationError('Space')
    }

    const data: { title?: string; description?: string | null; status?: MilestoneStatus; targetDate?: Date | null; spaceId?: string | null; order?: number } = {}
    if (input.title !== undefined) data.title = input.title.trim()
    if ('description' in input) data.description = input.description ?? null
    if (input.status !== undefined) data.status = input.status
    if ('targetDate' in input) data.targetDate = input.targetDate ? new Date(input.targetDate + 'T00:00:00.000Z') : null
    if ('spaceId' in input) data.spaceId = input.spaceId ?? null
    if (input.order !== undefined) data.order = input.order

    const updated = await this.milestoneRepo.update(input.milestoneId, data, input.userId)
    const dto = updated.toDTO()
    if (input.status !== undefined && input.status !== milestone.status) {
      const action = input.status === 'DONE' ? 'COMPLETED' : 'UPDATED'
      await this.activity.record({ userId: input.userId, spaceId: dto.spaceId, action, resourceType: 'MILESTONE', resourceId: dto.id, title: dto.title, metadata: { status: input.status } })
    }
    return dto
  }
}
