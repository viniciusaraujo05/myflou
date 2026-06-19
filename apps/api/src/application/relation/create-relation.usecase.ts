import type { IResourceLinkRepository } from '../../domain/relation/resource-link.repository.js'
import type { IResourceResolver, ResourceType } from '../../domain/relation/resource-resolver.js'
import { InvalidRelationError } from '../../domain/shared/domain-error.js'

interface Input {
  userId: string
  fromType: ResourceType
  fromId: string
  toType: ResourceType
  toId: string
}

export interface RelationDTO {
  id: string
  fromType: ResourceType
  fromId: string
  toType: ResourceType
  toId: string
}

const key = (t: ResourceType, id: string) => `${t}:${id}`

export class CreateRelationUseCase {
  constructor(
    private readonly linkRepo: IResourceLinkRepository,
    private readonly resolver: IResourceResolver,
  ) {}

  async execute(input: Input): Promise<RelationDTO> {
    if (input.fromType === input.toType && input.fromId === input.toId) {
      throw new InvalidRelationError('A resource cannot be linked to itself')
    }

    const [a, b] = await Promise.all([
      this.resolver.resolve(input.fromType, input.fromId),
      this.resolver.resolve(input.toType, input.toId),
    ])
    if (!a || a.userId !== input.userId) throw new InvalidRelationError('Source')
    if (!b || b.userId !== input.userId) throw new InvalidRelationError('Target')

    // Canonical order so the pair is stored once regardless of direction.
    let [fromType, fromId, toType, toId] = [input.fromType, input.fromId, input.toType, input.toId]
    if (key(fromType, fromId) > key(toType, toId)) {
      [fromType, fromId, toType, toId] = [input.toType, input.toId, input.fromType, input.fromId]
    }

    const existing = await this.linkRepo.findPair(input.userId, fromType, fromId, toType, toId)
    const link = existing ?? (await this.linkRepo.create(input.userId, fromType, fromId, toType, toId))
    return { id: link.id, fromType: link.fromType, fromId: link.fromId, toType: link.toType, toId: link.toId }
  }
}
