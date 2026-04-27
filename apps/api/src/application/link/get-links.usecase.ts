import type { ILinkRepository } from '../../domain/link/link.repository.js'
import type { LinkDTO } from '../../domain/link/link.entity.js'

interface Input {
  userId: string
  categoryId?: string
}

export class GetLinksUseCase {
  constructor(private readonly linkRepo: ILinkRepository) {}

  async execute(input: Input): Promise<LinkDTO[]> {
    const links = await this.linkRepo.findByUser(input.userId, input.categoryId)
    return links.map(l => l.toDTO())
  }
}
