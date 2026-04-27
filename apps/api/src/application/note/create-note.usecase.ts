import type { INotRepository } from '../../domain/note/note.repository.js'
import type { IFolderRepository } from '../../domain/folder/folder.repository.js'
import type { NoteDTO } from '../../domain/note/note.entity.js'
import { InvalidRelationError } from '../../domain/shared/domain-error.js'

interface Input {
  userId: string
  title: string
  folderId?: string | null
}

export class CreateNoteUseCase {
  constructor(
    private readonly noteRepo: INotRepository,
    private readonly folderRepo: IFolderRepository,
  ) {}

  async execute(input: Input): Promise<NoteDTO> {
    if (input.folderId) {
      const folder = await this.folderRepo.findById(input.folderId)
      if (!folder || folder.userId !== input.userId) throw new InvalidRelationError('Folder')
    }
    const note = await this.noteRepo.create(input.userId, input.title, input.folderId ?? null)
    return note.toDTO()
  }
}
