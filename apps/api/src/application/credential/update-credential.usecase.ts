import type { ICredentialRepository } from '../../domain/credential/credential.repository.js'
import type { ISpaceRepository } from '../../domain/space/space.repository.js'
import type { CredentialDTO } from '../../domain/credential/credential.entity.js'
import { InvalidRelationError, NotFoundError } from '../../domain/shared/domain-error.js'

export class UpdateCredentialUseCase {
  constructor(
    private readonly credentialRepo: ICredentialRepository,
    private readonly spaceRepo: ISpaceRepository,
  ) {}
  async execute(input: { credentialId: string; userId: string; service?: string; username?: string; password?: string; url?: string | null; notes?: string | null; spaceId?: string | null }): Promise<CredentialDTO> {
    const c = await this.credentialRepo.findById(input.credentialId)
    if (!c || c.userId !== input.userId) throw new NotFoundError('Credential')
    if (input.spaceId) {
      const space = await this.spaceRepo.findById(input.spaceId)
      if (!space || space.userId !== input.userId) throw new InvalidRelationError('Space')
    }
    const updated = await this.credentialRepo.update(input.credentialId, { service: input.service, username: input.username, password: input.password, url: input.url, notes: input.notes, spaceId: input.spaceId }, input.userId)
    return updated.toDTO()
  }
}
