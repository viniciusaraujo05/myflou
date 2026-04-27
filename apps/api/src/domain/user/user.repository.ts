import type { User, StatusRecord } from './user.entity.js'
import type { Email } from './value-objects/email.vo.js'
import type { HashedPassword } from './value-objects/password.vo.js'

export interface IUserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(email: Email, password: HashedPassword): Promise<User>
  incrementFailedAttempts(userId: string, lockedUntil: Date | null): Promise<void>
  resetFailedAttempts(userId: string): Promise<void>
  setStatuses(userId: string, statuses: StatusRecord[]): Promise<User>
}
