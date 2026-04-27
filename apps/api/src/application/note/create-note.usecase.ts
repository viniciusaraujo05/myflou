import type { INotRepository } from '../../domain/note/note.repository.js'
import type { NoteDTO } from '../../domain/note/note.entity.js'

interface Input {
  userId: string
  title: string
  folderId?: string | null
}

export class CreateNoteUseCase {
  constructor(private readonly noteRepo: INotRepository) {}

  async execute(input: Input): Promise<NoteDTO> {
    const note = await this.noteRepo.create(input.userId, input.title, input.folderId ?? null)
    return note.toDTO()
  }
}
