import type { IActivityEventRepository } from '../../domain/activity/activity-event.repository.js'
import type { ActivityEventDTO } from '../../domain/activity/activity-event.entity.js'

export class GetActivityUseCase {
  constructor(private readonly repo: IActivityEventRepository) {}

  async execute(input: { userId: string; spaceId?: string; limit?: number }): Promise<ActivityEventDTO[]> {
    const limit = Math.min(Math.max(input.limit ?? 30, 1), 100)
    const events = await this.repo.findByUser(input.userId, input.spaceId, limit)
    return events.map(e => e.toDTO())
  }
}
