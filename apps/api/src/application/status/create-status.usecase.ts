import { randomUUID } from 'crypto'
import { UserNotFoundError } from '../../domain/user/user.errors.js'
import type { IUserRepository } from '../../domain/user/user.repository.js'
import type { StatusRecord } from '../../domain/user/user.entity.js'

interface Input {
  userId: string
  name: string
  color: string
}

export class CreateStatusUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(input: Input): Promise<StatusRecord> {
    const user = await this.userRepo.findById(input.userId)
    if (!user) throw new UserNotFoundError()

    const newStatus: StatusRecord = {
      id: randomUUID(),
      name: input.name.trim(),
      color: input.color,
    }

    await this.userRepo.setStatuses(input.userId, [...user.statuses, newStatus])
    return newStatus
  }
}
