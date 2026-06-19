import type { ResourceType } from '../relation/resource-resolver.js'

export type ActivityAction = 'CREATED' | 'UPDATED' | 'COMPLETED' | 'DELETED'

export interface ActivityEventProps {
  id: string
  userId: string
  spaceId: string | null
  action: ActivityAction
  resourceType: ResourceType
  resourceId: string
  title: string
  metadata: Record<string, unknown> | null
  createdAt: Date
}

export interface ActivityEventDTO {
  id: string
  spaceId: string | null
  action: ActivityAction
  resourceType: ResourceType
  resourceId: string
  title: string
  metadata: Record<string, unknown> | null
  createdAt: string
}

export class ActivityEvent {
  private constructor(private readonly props: ActivityEventProps) {}

  static reconstitute(props: ActivityEventProps): ActivityEvent {
    return new ActivityEvent(props)
  }

  toDTO(): ActivityEventDTO {
    return {
      id: this.props.id,
      spaceId: this.props.spaceId,
      action: this.props.action,
      resourceType: this.props.resourceType,
      resourceId: this.props.resourceId,
      title: this.props.title,
      metadata: this.props.metadata,
      createdAt: this.props.createdAt.toISOString(),
    }
  }
}
