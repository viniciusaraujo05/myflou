import type { ISpaceRepository } from '../../domain/space/space.repository.js'
import type { SpaceDTO } from '../../domain/space/space.entity.js'

interface Input {
  userId: string
}

export class GetSpacesUseCase {
  constructor(private readonly spaceRepo: ISpaceRepository) {}

  async execute(input: Input): Promise<SpaceDTO[]> {
    const spaces = await this.spaceRepo.findByUser(input.userId)
    return spaces.map(s => s.toDTO())
  }
}
