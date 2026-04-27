import { UserNotFoundError } from '../../domain/user/user.errors.js'
import type { IUserRepository } from '../../domain/user/user.repository.js'
import type { StatusRecord } from '../../domain/user/user.entity.js'

export class GetStatusesUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(userId: string): Promise<StatusRecord[]> {
    const user = await this.userRepo.findById(userId)
    if (!user) throw new UserNotFoundError()
    return user.statuses
  }
}
