import type { ICredentialRepository } from '../../domain/credential/credential.repository.js'
import type { CredentialDTO } from '../../domain/credential/credential.entity.js'

export class UpdateCredentialUseCase {
  constructor(private readonly credentialRepo: ICredentialRepository) {}
  async execute(input: { credentialId: string; userId: string; service?: string; username?: string; password?: string; url?: string | null; notes?: string | null }): Promise<CredentialDTO> {
    const c = await this.credentialRepo.findById(input.credentialId)
    if (!c || c.userId !== input.userId) throw new Error('Not found')
    const updated = await this.credentialRepo.update(input.credentialId, { service: input.service, username: input.username, password: input.password, url: input.url, notes: input.notes })
    return updated.toDTO()
  }
}
