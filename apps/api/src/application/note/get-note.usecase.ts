import type { INotRepository } from '../../domain/note/note.repository.js'
import type { NoteDTO } from '../../domain/note/note.entity.js'

interface Input {
  noteId: string
  userId: string
}

export class GetNoteUseCase {
  constructor(private readonly noteRepo: INotRepository) {}

  async execute(input: Input): Promise<NoteDTO> {
    const note = await this.noteRepo.findById(input.noteId)
    if (!note || note.userId !== input.userId) throw new Error('Not found')
    return note.toDTO()
  }
}
