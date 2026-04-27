export interface NoteProps {
  id: string; userId: string; folderId: string | null
  title: string; content: unknown
  createdAt: Date; updatedAt: Date
}
export interface NoteDTO {
  id: string; userId: string; folderId: string | null
  title: string; content?: unknown
  createdAt: string; updatedAt: string
}
export interface NoteSummaryDTO {
  id: string; userId: string; folderId: string | null
  title: string; createdAt: string; updatedAt: string
}
export class Note {
  private constructor(private readonly props: NoteProps) {}
  static reconstitute(props: NoteProps) { return new Note(props) }
  get id() { return this.props.id }
  get userId() { return this.props.userId }
  get folderId() { return this.props.folderId }
  get title() { return this.props.title }
  get content() { return this.props.content }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }
  toDTO(): NoteDTO {
    return { id: this.props.id, userId: this.props.userId, folderId: this.props.folderId,
      title: this.props.title, content: this.props.content,
      createdAt: this.props.createdAt.toISOString(), updatedAt: this.props.updatedAt.toISOString() }
  }
  toSummaryDTO(): NoteSummaryDTO {
    return { id: this.props.id, userId: this.props.userId, folderId: this.props.folderId,
      title: this.props.title,
      createdAt: this.props.createdAt.toISOString(), updatedAt: this.props.updatedAt.toISOString() }
  }
}
