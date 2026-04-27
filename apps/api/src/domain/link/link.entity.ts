export interface LinkProps { id: string; userId: string; categoryId: string | null; title: string; url: string; description: string | null; username: string | null; password: string | null; createdAt: Date; updatedAt: Date }
export interface LinkDTO { id: string; userId: string; categoryId: string | null; title: string; url: string; description: string | null; username: string | null; password: string | null; createdAt: string; updatedAt: string }
export class Link {
  private constructor(private readonly props: LinkProps) {}
  static reconstitute(props: LinkProps) { return new Link(props) }
  get id() { return this.props.id }
  get userId() { return this.props.userId }
  get categoryId() { return this.props.categoryId }
  get title() { return this.props.title }
  get url() { return this.props.url }
  get description() { return this.props.description }
  get username() { return this.props.username }
  get password() { return this.props.password }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }
  toDTO(): LinkDTO {
    return { id: this.props.id, userId: this.props.userId, categoryId: this.props.categoryId,
      title: this.props.title, url: this.props.url, description: this.props.description,
      username: this.props.username, password: this.props.password,
      createdAt: this.props.createdAt.toISOString(), updatedAt: this.props.updatedAt.toISOString() }
  }
}
