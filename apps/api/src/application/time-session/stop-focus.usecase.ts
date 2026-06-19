import type { ITimeSessionRepository } from '../../domain/time-session/time-session.repository.js'
import type { TimeSessionDTO } from '../../domain/time-session/time-session.entity.js'

export class StopFocusUseCase {
  constructor(private readonly sessionRepo: ITimeSessionRepository) {}

  /** Stops the user's active session, if any. Returns the stopped session or null. */
  async execute(input: { userId: string }): Promise<TimeSessionDTO | null> {
    const active = await this.sessionRepo.findActive(input.userId)
    if (!active) return null
    const endedAt = new Date()
    const durationSec = Math.max(0, Math.round((endedAt.getTime() - active.startedAt.getTime()) / 1000))
    const stopped = await this.sessionRepo.stop(active.id, endedAt, durationSec, input.userId)
    return stopped.toDTO()
  }
}
