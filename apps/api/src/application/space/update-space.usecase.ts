import type { ISpaceRepository } from '../../domain/space/space.repository.js'
import type { SpaceDTO } from '../../domain/space/space.entity.js'
import { SpaceNotFoundError, SpaceAccessDeniedError } from '../../domain/space/space.errors.js'

interface Input {
  spaceId: string
  userId: string
  name?: string
  color?: string
  icon?: string | null
  order?: number
  archived?: boolean
}

export class UpdateSpaceUseCase {
  constructor(private readonly spaceRepo: ISpaceRepository) {}

  async execute(input: Input): Promise<SpaceDTO> {
    const space = await this.spaceRepo.findById(input.spaceId)
    if (!space) throw new SpaceNotFoundError()
    if (space.userId !== input.userId) throw new SpaceAccessDeniedError()

    const data: { name?: string; color?: string; icon?: string | null; order?: number; archived?: boolean } = {}
    if (input.name !== undefined) data.name = input.name.trim()
    if (input.color !== undefined) data.color = input.color
    if ('icon' in input) data.icon = input.icon ?? null
    if (input.order !== undefined) data.order = input.order
    if (input.archived !== undefined) data.archived = input.archived

    const updated = await this.spaceRepo.update(input.spaceId, data, input.userId)
    return updated.toDTO()
  }
}
