import { UserNotFoundError } from '../../domain/user/user.errors.js'
import type { IUserRepository } from '../../domain/user/user.repository.js'
import type { UserDTO } from '../../domain/user/user.entity.js'

interface UpdateProfileInput {
  userId: string
  name: string | null
}

export class UpdateProfileUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(input: UpdateProfileInput): Promise<UserDTO> {
    const user = await this.userRepo.findById(input.userId)
    if (!user) throw new UserNotFoundError()

    const updated = await this.userRepo.updateProfile(input.userId, input.name)
    return updated.toDTO()
  }
}
