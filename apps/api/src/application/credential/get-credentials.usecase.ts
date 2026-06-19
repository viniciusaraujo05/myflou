import type { ICredentialRepository } from '../../domain/credential/credential.repository.js'
import type { CredentialDTO } from '../../domain/credential/credential.entity.js'

export class GetCredentialsUseCase {
  constructor(private readonly credentialRepo: ICredentialRepository) {}
  async execute(input: { userId: string; spaceId?: string }): Promise<CredentialDTO[]> {
    const list = await this.credentialRepo.findByUser(input.userId, input.spaceId)
    return list.map(c => c.toDTO())
  }
}
