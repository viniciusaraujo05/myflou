import type { ICredentialRepository } from '../../domain/credential/credential.repository.js'
import type { ISpaceRepository } from '../../domain/space/space.repository.js'
import type { CredentialDTO } from '../../domain/credential/credential.entity.js'
import { InvalidRelationError } from '../../domain/shared/domain-error.js'

export class CreateCredentialUseCase {
  constructor(
    private readonly credentialRepo: ICredentialRepository,
    private readonly spaceRepo: ISpaceRepository,
  ) {}
  async execute(input: { userId: string; service: string; username: string; password: string; url?: string | null; notes?: string | null; spaceId?: string | null }): Promise<CredentialDTO> {
    if (input.spaceId) {
      const space = await this.spaceRepo.findById(input.spaceId)
      if (!space || space.userId !== input.userId) throw new InvalidRelationError('Space')
    }
    const c = await this.credentialRepo.create(input.userId, { service: input.service, username: input.username, password: input.password, url: input.url ?? null, notes: input.notes ?? null, spaceId: input.spaceId ?? null })
    return c.toDTO()
  }
}
