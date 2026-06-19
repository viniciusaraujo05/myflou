import type { IMilestoneRepository } from '../../domain/milestone/milestone.repository.js'
import type { MilestoneDTO } from '../../domain/milestone/milestone.entity.js'

interface Input {
  userId: string
  spaceId?: string
}

export class GetMilestonesUseCase {
  constructor(private readonly milestoneRepo: IMilestoneRepository) {}

  async execute(input: Input): Promise<MilestoneDTO[]> {
    const milestones = await this.milestoneRepo.findByUser(input.userId, input.spaceId)
    return milestones.map(m => m.toDTO())
  }
}
