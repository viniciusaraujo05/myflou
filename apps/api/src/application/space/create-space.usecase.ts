import type { ISpaceRepository } from '../../domain/space/space.repository.js'
import type { SpaceDTO } from '../../domain/space/space.entity.js'

interface Input {
  userId: string
  name: string
  color?: string
  icon?: string | null
  order?: number
}

export class CreateSpaceUseCase {
  constructor(private readonly spaceRepo: ISpaceRepository) {}

  async execute(input: Input): Promise<SpaceDTO> {
    const space = await this.spaceRepo.create(input.userId, {
      name: input.name.trim(),
      color: input.color,
      icon: input.icon ?? null,
      order: input.order,
    })
    return space.toDTO()
  }
}
