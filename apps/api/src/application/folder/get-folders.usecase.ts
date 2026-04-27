import type { IFolderRepository } from '../../domain/folder/folder.repository.js'
import type { FolderDTO } from '../../domain/folder/folder.entity.js'

export class GetFoldersUseCase {
  constructor(private readonly folderRepo: IFolderRepository) {}

  async execute(userId: string): Promise<FolderDTO[]> {
    const folders = await this.folderRepo.findByUser(userId)
    return folders.map(f => f.toDTO())
  }
}
