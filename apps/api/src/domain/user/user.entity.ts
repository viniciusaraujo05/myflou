import type { Email } from './value-objects/email.vo.js'
import type { HashedPassword } from './value-objects/password.vo.js'

export interface StatusRecord {
  id: string
  name: string
  color: string
}

export interface UserProps {
  id: string
  email: Email
  password: HashedPassword | null
  googleId: string | null
  failedLoginAttempts: number
  lockedUntil: Date | null
  statuses: StatusRecord[]
  createdAt: Date
  updatedAt: Date
}

export interface UserDTO {
  id: string
  email: string
  statuses: StatusRecord[]
  createdAt: string
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static reconstitute(props: UserProps): User {
    return new User(props)
  }

  get id(): string { return this.props.id }
  get email(): Email { return this.props.email }
  get password(): HashedPassword | null { return this.props.password }
  get googleId(): string | null { return this.props.googleId }
  get failedLoginAttempts(): number { return this.props.failedLoginAttempts }
  get lockedUntil(): Date | null { return this.props.lockedUntil }
  get statuses(): StatusRecord[] { return this.props.statuses }
  get createdAt(): Date { return this.props.createdAt }

  toDTO(): UserDTO {
    return {
      id: this.props.id,
      email: this.props.email.value,
      statuses: this.props.statuses,
      createdAt: this.props.createdAt.toISOString(),
    }
  }
}
