import type { ResourceType } from './resource-resolver.js'

export interface ResourceLinkProps {
  id: string
  userId: string
  fromType: ResourceType
  fromId: string
  toType: ResourceType
  toId: string
  createdAt: Date
}

export class ResourceLink {
  private constructor(private readonly props: ResourceLinkProps) {}

  static reconstitute(props: ResourceLinkProps): ResourceLink {
    return new ResourceLink(props)
  }

  get id(): string { return this.props.id }
  get userId(): string { return this.props.userId }
  get fromType(): ResourceType { return this.props.fromType }
  get fromId(): string { return this.props.fromId }
  get toType(): ResourceType { return this.props.toType }
  get toId(): string { return this.props.toId }

  /** Given one endpoint, returns the other (used to list "what is related to X"). */
  other(type: ResourceType, id: string): { type: ResourceType; id: string } {
    if (this.props.fromType === type && this.props.fromId === id) {
      return { type: this.props.toType, id: this.props.toId }
    }
    return { type: this.props.fromType, id: this.props.fromId }
  }
}
