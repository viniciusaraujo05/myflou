import type { IResourceLinkRepository } from '../../domain/relation/resource-link.repository.js'
import type { IResourceResolver, ResourceType } from '../../domain/relation/resource-resolver.js'

export interface RelatedResourceDTO {
  linkId: string
  type: ResourceType
  id: string
  title: string
}

export class GetRelationsUseCase {
  constructor(
    private readonly linkRepo: IResourceLinkRepository,
    private readonly resolver: IResourceResolver,
  ) {}

  async execute(input: { userId: string; type: ResourceType; id: string }): Promise<RelatedResourceDTO[]> {
    const links = await this.linkRepo.findForResource(input.userId, input.type, input.id)
    const out: RelatedResourceDTO[] = []
    for (const link of links) {
      const other = link.other(input.type, input.id)
      const resolved = await this.resolver.resolve(other.type, other.id)
      if (resolved && resolved.userId === input.userId) {
        out.push({ linkId: link.id, type: resolved.type, id: resolved.id, title: resolved.title })
      }
      // Unresolvable = the linked resource was deleted; skip it.
    }
    return out
  }
}
