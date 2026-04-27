export interface FolderProps { id: string; userId: string; name: string; color: string; createdAt: Date; updatedAt: Date }
export interface FolderDTO { id: string; userId: string; name: string; color: string; noteCount?: number; createdAt: string; updatedAt: string }
export class Folder {
  private constructor(private readonly props: FolderProps) {}
  static reconstitute(props: FolderProps) { return new Folder(props) }
  get id() { return this.props.id }
  get userId() { return this.props.userId }
  get name() { return this.props.name }
  get color() { return this.props.color }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }
  toDTO(): FolderDTO {
    return { id: this.props.id, userId: this.props.userId, name: this.props.name, color: this.props.color,
      createdAt: this.props.createdAt.toISOString(), updatedAt: this.props.updatedAt.toISOString() }
  }
}
