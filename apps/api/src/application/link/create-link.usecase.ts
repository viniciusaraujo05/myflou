import type { ILinkRepository } from '../../domain/link/link.repository.js'
import type { LinkDTO } from '../../domain/link/link.entity.js'

interface Input {
  userId: string
  title: string
  url: string
  description?: string | null
  username?: string | null
  password?: string | null
  categoryId?: string | null
}

export class CreateLinkUseCase {
  constructor(private readonly linkRepo: ILinkRepository) {}

  async execute(input: Input): Promise<LinkDTO> {
    const link = await this.linkRepo.create(input.userId, {
      title: input.title,
      url: input.url,
      description: input.description ?? null,
      username: input.username ?? null,
      password: input.password ?? null,
      categoryId: input.categoryId ?? null,
    })
    return link.toDTO()
  }
}
