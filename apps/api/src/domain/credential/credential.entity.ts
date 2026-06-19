
export interface CredentialProps {
  id: string; userId: string; spaceId: string | null; service: string; username: string
  password: string; url: string | null; notes: string | null
  createdAt: Date; updatedAt: Date
}
export interface CredentialDTO {
  id: string; userId: string; spaceId: string | null; service: string; username: string
  password: string; url: string | null; notes: string | null
  createdAt: string; updatedAt: string
}
export class Credential {
  private constructor(private readonly props: CredentialProps) {}
  static reconstitute(props: CredentialProps) { return new Credential(props) }
  get id() { return this.props.id }
  get userId() { return this.props.userId }
  get spaceId() { return this.props.spaceId }
  get service() { return this.props.service }
  get username() { return this.props.username }
  get password() { return this.props.password }
  get url() { return this.props.url }
  get notes() { return this.props.notes }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }
  toDTO(): CredentialDTO {
    return {
      id: this.props.id, userId: this.props.userId, spaceId: this.props.spaceId, service: this.props.service,
      username: this.props.username, password: this.props.password,
      url: this.props.url, notes: this.props.notes,
      createdAt: this.props.createdAt.toISOString(), updatedAt: this.props.updatedAt.toISOString(),
    }
  }
}
