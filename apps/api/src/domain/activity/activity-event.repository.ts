import type { ActivityEvent } from './activity-event.entity.js'
import type { ActivityInput } from './activity-recorder.js'

export interface IActivityEventRepository {
  create(input: ActivityInput): Promise<void>
  findByUser(userId: string, spaceId: string | undefined, limit: number): Promise<ActivityEvent[]>
}
