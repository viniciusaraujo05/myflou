import type { IFolderRepository } from '../../domain/folder/folder.repository.js'
import type { FolderDTO } from '../../domain/folder/folder.entity.js'

interface Input {
  folderId: string
  name?: string
  color?: string
}

export class UpdateFolderUseCase {
  constructor(private readonly folderRepo: IFolderRepository) {}

  async execute(input: Input): Promise<FolderDTO> {
    const data: { name?: string; color?: string } = {}
    if (input.name !== undefined) data.name = input.name.trim()
    if (input.color !== undefined) data.color = input.color
    const folder = await this.folderRepo.update(input.folderId, data)
    return folder.toDTO()
  }
}
