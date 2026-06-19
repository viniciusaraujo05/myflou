import type { IMilestoneRepository } from '../../domain/milestone/milestone.repository.js'
import { MilestoneNotFoundError, MilestoneAccessDeniedError } from '../../domain/milestone/milestone.errors.js'

interface Input {
  milestoneId: string
  userId: string
}

export class DeleteMilestoneUseCase {
  constructor(private readonly milestoneRepo: IMilestoneRepository) {}

  async execute(input: Input): Promise<void> {
    const milestone = await this.milestoneRepo.findById(input.milestoneId)
    if (!milestone) throw new MilestoneNotFoundError()
    if (milestone.userId !== input.userId) throw new MilestoneAccessDeniedError()
    // Linked tasks keep existing — their milestoneId is set to null via onDelete: SetNull.
    await this.milestoneRepo.delete(input.milestoneId, input.userId)
  }
}
