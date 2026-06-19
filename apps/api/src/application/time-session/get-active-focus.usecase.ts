import type { ITimeSessionRepository } from '../../domain/time-session/time-session.repository.js'
import type { TimeSessionDTO } from '../../domain/time-session/time-session.entity.js'

export class GetActiveFocusUseCase {
  constructor(private readonly sessionRepo: ITimeSessionRepository) {}

  async execute(input: { userId: string }): Promise<TimeSessionDTO | null> {
    const active = await this.sessionRepo.findActive(input.userId)
    return active ? active.toDTO() : null
  }
}
