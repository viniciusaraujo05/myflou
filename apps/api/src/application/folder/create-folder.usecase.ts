import type { IFolderRepository } from '../../domain/folder/folder.repository.js'
import type { FolderDTO } from '../../domain/folder/folder.entity.js'

interface Input {
  userId: string
  name: string
  color: string
}

export class CreateFolderUseCase {
  constructor(private readonly folderRepo: IFolderRepository) {}

  async execute(input: Input): Promise<FolderDTO> {
    const folder = await this.folderRepo.create(input.userId, input.name.trim(), input.color)
    return folder.toDTO()
  }
}
