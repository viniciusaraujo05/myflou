import type { ITimeSessionRepository } from '../../domain/time-session/time-session.repository.js'

export interface TimeSummary {
  todaySec: number
  weekSec: number
  monthSec: number
  activeSince: string | null
}

function startOfToday(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}
function startOfWeek(now: Date): Date {
  const d = startOfToday(now)
  const diff = (d.getDay() + 6) % 7 // Monday-based
  d.setDate(d.getDate() - diff)
  return d
}
function startOfMonth(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

export class GetTimeSummaryUseCase {
  constructor(private readonly sessionRepo: ITimeSessionRepository) {}

  async execute(input: { userId: string; spaceId?: string }): Promise<TimeSummary> {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const weekStart = startOfWeek(now)
    const todayStart = startOfToday(now)

    const sessions = await this.sessionRepo.findSince(input.userId, monthStart, input.spaceId)

    let todaySec = 0, weekSec = 0, monthSec = 0
    let activeSince: string | null = null

    for (const s of sessions) {
      const dto = s.toDTO()
      const started = new Date(dto.startedAt)
      const seconds = dto.durationSec ?? Math.max(0, Math.round((now.getTime() - started.getTime()) / 1000))
      if (dto.endedAt === null) activeSince = dto.startedAt
      monthSec += seconds
      if (started >= weekStart) weekSec += seconds
      if (started >= todayStart) todaySec += seconds
    }

    return { todaySec, weekSec, monthSec, activeSince }
  }
}
