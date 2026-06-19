import type { IMilestoneRepository } from '../../domain/milestone/milestone.repository.js'
import type { ISpaceRepository } from '../../domain/space/space.repository.js'
import type { MilestoneDTO, MilestoneStatus } from '../../domain/milestone/milestone.entity.js'
import { InvalidRelationError } from '../../domain/shared/domain-error.js'

interface Input {
  userId: string
  title: string
  description?: string | null
  status?: MilestoneStatus
  targetDate?: string | null // YYYY-MM-DD
  spaceId?: string | null
  order?: number
}

export class CreateMilestoneUseCase {
  constructor(
    private readonly milestoneRepo: IMilestoneRepository,
    private readonly spaceRepo: ISpaceRepository,
  ) {}

  async execute(input: Input): Promise<MilestoneDTO> {
    if (input.spaceId) {
      const space = await this.spaceRepo.findById(input.spaceId)
      if (!space || space.userId !== input.userId) throw new InvalidRelationError('Space')
    }
    const milestone = await this.milestoneRepo.create(input.userId, {
      title: input.title.trim(),
      description: input.description ?? null,
      status: input.status,
      targetDate: input.targetDate ? new Date(input.targetDate + 'T00:00:00.000Z') : null,
      spaceId: input.spaceId ?? null,
      order: input.order,
    })
    return milestone.toDTO()
  }
}
