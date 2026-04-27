import type { INotRepository } from '../../domain/note/note.repository.js'
import type { NoteSummaryDTO } from '../../domain/note/note.entity.js'

interface Input {
  userId: string
  folderId?: string
  q?: string
}

export class GetNotesUseCase {
  constructor(private readonly noteRepo: INotRepository) {}

  async execute(input: Input): Promise<NoteSummaryDTO[]> {
    const notes = await this.noteRepo.findByUser(input.userId, input.folderId, input.q)
    return notes.map(n => n.toSummaryDTO())
  }
}
