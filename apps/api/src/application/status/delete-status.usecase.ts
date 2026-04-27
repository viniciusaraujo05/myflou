import { UserNotFoundError } from '../../domain/user/user.errors.js'
import { NotFoundError } from '../../domain/shared/domain-error.js'
import type { IUserRepository } from '../../domain/user/user.repository.js'

interface Input {
  userId: string
  statusId: string
}

export class DeleteStatusUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(input: Input): Promise<void> {
    const user = await this.userRepo.findById(input.userId)
    if (!user) throw new UserNotFoundError()
    if (!user.statuses.some(s => s.id === input.statusId)) throw new NotFoundError('Status')
    const statuses = user.statuses.filter(s => s.id !== input.statusId)
    await this.userRepo.setStatuses(input.userId, statuses)
  }
}
