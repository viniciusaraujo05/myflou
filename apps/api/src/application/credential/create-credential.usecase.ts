import type { ICredentialRepository } from '../../domain/credential/credential.repository.js'
import type { CredentialDTO } from '../../domain/credential/credential.entity.js'

export class CreateCredentialUseCase {
  constructor(private readonly credentialRepo: ICredentialRepository) {}
  async execute(input: { userId: string; service: string; username: string; password: string; url?: string | null; notes?: string | null }): Promise<CredentialDTO> {
    const c = await this.credentialRepo.create(input.userId, { service: input.service, username: input.username, password: input.password, url: input.url ?? null, notes: input.notes ?? null })
    return c.toDTO()
  }
}
