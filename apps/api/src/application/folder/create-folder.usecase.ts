import type { IFolderRepository } from '../../domain/folder/folder.repository.js'
import type { ISpaceRepository } from '../../domain/space/space.repository.js'
import type { FolderDTO } from '../../domain/folder/folder.entity.js'
import { InvalidRelationError } from '../../domain/shared/domain-error.js'

interface Input {
  userId: string
  name: string
  color: string
  spaceId?: string | null
}

export class CreateFolderUseCase {
  constructor(
    private readonly folderRepo: IFolderRepository,
    private readonly spaceRepo: ISpaceRepository,
  ) {}

  async execute(input: Input): Promise<FolderDTO> {
    if (input.spaceId) {
      const space = await this.spaceRepo.findById(input.spaceId)
      if (!space || space.userId !== input.userId) throw new InvalidRelationError('Space')
    }
    const folder = await this.folderRepo.create(input.userId, input.name.trim(), input.color, input.spaceId ?? null)
    return folder.toDTO()
  }
}
