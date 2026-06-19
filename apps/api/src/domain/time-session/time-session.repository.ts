import type { TimeSession } from './time-session.entity.js'

export interface ITimeSessionRepository {
  create(userId: string, data: { spaceId?: string | null; taskId?: string | null; note?: string | null }): Promise<TimeSession>
  findActive(userId: string): Promise<TimeSession | null>
  /** Mark a session ended with a computed duration. */
  stop(id: string, endedAt: Date, durationSec: number, userId: string): Promise<TimeSession>
  /** Sessions for a user that started at or after `since`, optionally scoped to a space. */
  findSince(userId: string, since: Date, spaceId?: string): Promise<TimeSession[]>
}
