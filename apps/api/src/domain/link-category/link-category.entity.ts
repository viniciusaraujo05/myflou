export interface LinkCategoryProps { id: string; userId: string; spaceId: string | null; name: string; color: string; createdAt: Date; updatedAt: Date }
export interface LinkCategoryDTO { id: string; userId: string; spaceId: string | null; name: string; color: string; createdAt: string; updatedAt: string }
export class LinkCategory {
  private constructor(private readonly props: LinkCategoryProps) {}
  static reconstitute(props: LinkCategoryProps) { return new LinkCategory(props) }
  get id() { return this.props.id }
  get userId() { return this.props.userId }
  get spaceId() { return this.props.spaceId }
  get name() { return this.props.name }
  get color() { return this.props.color }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }
  toDTO(): LinkCategoryDTO {
    return { id: this.props.id, userId: this.props.userId, spaceId: this.props.spaceId, name: this.props.name, color: this.props.color,
      createdAt: this.props.createdAt.toISOString(), updatedAt: this.props.updatedAt.toISOString() }
  }
}
