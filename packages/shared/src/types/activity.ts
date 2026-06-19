import type { ResourceType } from './relation'

export type ActivityAction = 'CREATED' | 'UPDATED' | 'COMPLETED' | 'DELETED'

export interface ActivityEvent {
  id: string
  spaceId: string | null
  action: ActivityAction
  resourceType: ResourceType
  resourceId: string
  title: string
  metadata: Record<string, unknown> | null
  createdAt: string
}
