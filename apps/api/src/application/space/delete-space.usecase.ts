import type { ISpaceRepository } from '../../domain/space/space.repository.js'
import { SpaceNotFoundError, SpaceAccessDeniedError } from '../../domain/space/space.errors.js'

interface Input {
  spaceId: string
  userId: string
}

export class DeleteSpaceUseCase {
  constructor(private readonly spaceRepo: ISpaceRepository) {}

  async execute(input: Input): Promise<void> {
    const space = await this.spaceRepo.findById(input.spaceId)
    if (!space) throw new SpaceNotFoundError()
    if (space.userId !== input.userId) throw new SpaceAccessDeniedError()
    // Resources keep existing — their spaceId is set to null (Inbox) via onDelete: SetNull.
    await this.spaceRepo.delete(input.spaceId, input.userId)
  }
}
