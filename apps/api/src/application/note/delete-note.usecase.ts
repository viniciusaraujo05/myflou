import type { INotRepository } from '../../domain/note/note.repository.js'

interface Input {
  noteId: string
  userId: string
}

export class DeleteNoteUseCase {
  constructor(private readonly noteRepo: INotRepository) {}

  async execute(input: Input): Promise<void> {
    const note = await this.noteRepo.findById(input.noteId)
    if (!note || note.userId !== input.userId) throw new Error('Not found')
    await this.noteRepo.delete(input.noteId)
  }
}
