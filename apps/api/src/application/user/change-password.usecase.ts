import { HashedPassword } from '../../domain/user/value-objects/password.vo.js'
import { UserNotFoundError, InvalidCurrentPasswordError } from '../../domain/user/user.errors.js'
import type { IUserRepository } from '../../domain/user/user.repository.js'

interface ChangePasswordInput {
  userId: string
  currentPassword?: string
  newPassword: string
}

export class ChangePasswordUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(input: ChangePasswordInput): Promise<void> {
    const user = await this.userRepo.findById(input.userId)
    if (!user) throw new UserNotFoundError()

    if (user.password !== null) {
      // User has a password — they must supply the current one
      if (!input.currentPassword) throw new InvalidCurrentPasswordError()
      const matches = await user.password.compare(input.currentPassword)
      if (!matches) throw new InvalidCurrentPasswordError()
    }

    const newHashed = await HashedPassword.fromPlain(input.newPassword)
    await this.userRepo.updatePassword(input.userId, newHashed)
  }
}
