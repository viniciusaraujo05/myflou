import type { INotRepository } from '../../domain/note/note.repository.js'
import type { IFolderRepository } from '../../domain/folder/folder.repository.js'
import type { ISpaceRepository } from '../../domain/space/space.repository.js'
import type { IActivityRecorder } from '../../domain/activity/activity-recorder.js'
import type { NoteDTO } from '../../domain/note/note.entity.js'
import { InvalidRelationError } from '../../domain/shared/domain-error.js'

interface Input {
  userId: string
  title: string
  folderId?: string | null
  spaceId?: string | null
}

export class CreateNoteUseCase {
  constructor(
    private readonly noteRepo: INotRepository,
    private readonly folderRepo: IFolderRepository,
    private readonly spaceRepo: ISpaceRepository,
    private readonly activity: IActivityRecorder,
  ) {}

  async execute(input: Input): Promise<NoteDTO> {
    if (input.folderId) {
      const folder = await this.folderRepo.findById(input.folderId)
      if (!folder || folder.userId !== input.userId) throw new InvalidRelationError('Folder')
    }
    if (input.spaceId) {
      const space = await this.spaceRepo.findById(input.spaceId)
      if (!space || space.userId !== input.userId) throw new InvalidRelationError('Space')
    }
    const note = await this.noteRepo.create(input.userId, input.title, input.folderId ?? null, input.spaceId ?? null)
    await this.activity.record({ userId: input.userId, spaceId: note.spaceId, action: 'CREATED', resourceType: 'NOTE', resourceId: note.id, title: note.title })
    return note.toDTO()
  }
}
