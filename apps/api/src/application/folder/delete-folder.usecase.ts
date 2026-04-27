import type { IFolderRepository } from '../../domain/folder/folder.repository.js'

export class DeleteFolderUseCase {
  constructor(private readonly folderRepo: IFolderRepository) {}

  async execute(folderId: string): Promise<void> {
    await this.folderRepo.delete(folderId)
  }
}
