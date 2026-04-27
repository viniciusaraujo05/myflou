import { UserNotFoundError } from '../../domain/user/user.errors.js'
import type { IUserRepository } from '../../domain/user/user.repository.js'
import type { UserDTO } from '../../domain/user/user.entity.js'

export class GetMeUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(userId: string): Promise<UserDTO> {
    const user = await this.userRepo.findById(userId)
    if (!user) throw new UserNotFoundError()
    return user.toDTO()
  }
}
