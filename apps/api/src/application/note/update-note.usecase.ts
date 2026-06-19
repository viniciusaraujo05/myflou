import type { INotRepository } from '../../domain/note/note.repository.js'
import type { IFolderRepository } from '../../domain/folder/folder.repository.js'
import type { ISpaceRepository } from '../../domain/space/space.repository.js'
import type { NoteDTO } from '../../domain/note/note.entity.js'
import { InvalidRelationError, NotFoundError } from '../../domain/shared/domain-error.js'

interface Input {
  noteId: string
  userId: string
  title?: string
  content?: unknown
  folderId?: string | null
  spaceId?: string | null
}

export class UpdateNoteUseCase {
  constructor(
    private readonly noteRepo: INotRepository,
    private readonly folderRepo: IFolderRepository,
    private readonly spaceRepo: ISpaceRepository,
  ) {}

  async execute(input: Input): Promise<NoteDTO> {
    const note = await this.noteRepo.findById(input.noteId)
    if (!note || note.userId !== input.userId) throw new NotFoundError('Note')

    if (input.folderId) {
      const folder = await this.folderRepo.findById(input.folderId)
      if (!folder || folder.userId !== input.userId) throw new InvalidRelationError('Folder')
    }
    if (input.spaceId) {
      const space = await this.spaceRepo.findById(input.spaceId)
      if (!space || space.userId !== input.userId) throw new InvalidRelationError('Space')
    }

    const data: { title?: string; content?: unknown; folderId?: string | null; spaceId?: string | null } = {}
    if (input.title !== undefined) data.title = input.title
    if (input.content !== undefined) data.content = input.content
    if ('folderId' in input) data.folderId = input.folderId ?? null
    if ('spaceId' in input) data.spaceId = input.spaceId ?? null

    const updated = await this.noteRepo.update(input.noteId, data, input.userId)
    return updated.toDTO()
  }
}
