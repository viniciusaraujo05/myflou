import type { IFolderRepository } from '../../domain/folder/folder.repository.js'
import { NotFoundError } from '../../domain/shared/domain-error.js'

export class DeleteFolderUseCase {
  constructor(private readonly folderRepo: IFolderRepository) {}

  async execute(input: { folderId: string; userId: string }): Promise<void> {
    const existing = await this.folderRepo.findById(input.folderId)
    if (!existing || existing.userId !== input.userId) throw new NotFoundError('Folder')
    await this.folderRepo.delete(input.folderId)
  }
}
