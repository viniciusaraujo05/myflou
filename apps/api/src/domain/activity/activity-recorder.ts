import type { ResourceType } from '../relation/resource-resolver.js'
import type { ActivityAction } from './activity-event.entity.js'

export interface ActivityInput {
  userId: string
  spaceId?: string | null
  action: ActivityAction
  resourceType: ResourceType
  resourceId: string
  title: string
  metadata?: Record<string, unknown> | null
}

/**
 * Records a domain event to the activity feed. Implementations MUST be
 * fire-and-forget safe — a recording failure must never break the operation
 * that triggered it.
 */
export interface IActivityRecorder {
  record(input: ActivityInput): Promise<void>
}
