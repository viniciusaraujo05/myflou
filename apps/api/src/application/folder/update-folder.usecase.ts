import type { IFolderRepository } from '../../domain/folder/folder.repository.js'
import type { ISpaceRepository } from '../../domain/space/space.repository.js'
import type { FolderDTO } from '../../domain/folder/folder.entity.js'
import { InvalidRelationError, NotFoundError } from '../../domain/shared/domain-error.js'

interface Input {
  folderId: string
  userId: string
  name?: string
  color?: string
  spaceId?: string | null
}

export class UpdateFolderUseCase {
  constructor(
    private readonly folderRepo: IFolderRepository,
    private readonly spaceRepo: ISpaceRepository,
  ) {}

  async execute(input: Input): Promise<FolderDTO> {
    const existing = await this.folderRepo.findById(input.folderId)
    if (!existing || existing.userId !== input.userId) throw new NotFoundError('Folder')
    if (input.spaceId) {
      const space = await this.spaceRepo.findById(input.spaceId)
      if (!space || space.userId !== input.userId) throw new InvalidRelationError('Space')
    }

    const data: { name?: string; color?: string; spaceId?: string | null } = {}
    if (input.name !== undefined) data.name = input.name.trim()
    if (input.color !== undefined) data.color = input.color
    if ('spaceId' in input) data.spaceId = input.spaceId ?? null
    const folder = await this.folderRepo.update(input.folderId, data, input.userId)
    return folder.toDTO()
  }
}
