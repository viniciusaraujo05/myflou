import type { INotRepository } from '../../domain/note/note.repository.js'
import type { IFolderRepository } from '../../domain/folder/folder.repository.js'
import type { NoteDTO } from '../../domain/note/note.entity.js'
import { InvalidRelationError, NotFoundError } from '../../domain/shared/domain-error.js'

interface Input {
  noteId: string
  userId: string
  title?: string
  content?: unknown
  folderId?: string | null
}

export class UpdateNoteUseCase {
  constructor(
    private readonly noteRepo: INotRepository,
    private readonly folderRepo: IFolderRepository,
  ) {}

  async execute(input: Input): Promise<NoteDTO> {
    const note = await this.noteRepo.findById(input.noteId)
    if (!note || note.userId !== input.userId) throw new NotFoundError('Note')

    if (input.folderId) {
      const folder = await this.folderRepo.findById(input.folderId)
      if (!folder || folder.userId !== input.userId) throw new InvalidRelationError('Folder')
    }

    const data: { title?: string; content?: unknown; folderId?: string | null } = {}
    if (input.title !== undefined) data.title = input.title
    if (input.content !== undefined) data.content = input.content
    if ('folderId' in input) data.folderId = input.folderId ?? null

    const updated = await this.noteRepo.update(input.noteId, data)
    return updated.toDTO()
  }
}
