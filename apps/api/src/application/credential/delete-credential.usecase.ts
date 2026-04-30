import type { ICredentialRepository } from '../../domain/credential/credential.repository.js'
import { NotFoundError } from '../../domain/shared/domain-error.js'

export class DeleteCredentialUseCase {
  constructor(private readonly credentialRepo: ICredentialRepository) {}
  async execute(input: { credentialId: string; userId: string }): Promise<void> {
    const c = await this.credentialRepo.findById(input.credentialId)
    if (!c || c.userId !== input.userId) throw new NotFoundError('Credential')
    await this.credentialRepo.delete(input.credentialId, input.userId)
  }
}
