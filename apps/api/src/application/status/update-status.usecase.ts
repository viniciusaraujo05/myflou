import { UserNotFoundError } from '../../domain/user/user.errors.js'
import type { IUserRepository } from '../../domain/user/user.repository.js'
import type { StatusRecord } from '../../domain/user/user.entity.js'

interface Input {
  userId: string
  statusId: string
  name?: string
  color?: string
}

export class UpdateStatusUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(input: Input): Promise<StatusRecord> {
    const user = await this.userRepo.findById(input.userId)
    if (!user) throw new UserNotFoundError()

    const existing = user.statuses.find(s => s.id === input.statusId)
    if (!existing) throw new Error('Status not found')

    const updated: StatusRecord = {
      ...existing,
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.color !== undefined ? { color: input.color } : {}),
    }

    const statuses = user.statuses.map(s => s.id === input.statusId ? updated : s)
    await this.userRepo.setStatuses(input.userId, statuses)
    return updated
  }
}
