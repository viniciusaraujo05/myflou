import type { ILinkRepository } from '../../domain/link/link.repository.js'

interface Input {
  linkId: string
  userId: string
}

export class DeleteLinkUseCase {
  constructor(private readonly linkRepo: ILinkRepository) {}

  async execute(input: Input): Promise<void> {
    const link = await this.linkRepo.findById(input.linkId)
    if (!link || link.userId !== input.userId) throw new Error('Not found')
    await this.linkRepo.delete(input.linkId)
  }
}
