export interface TimeSession {
  id: string
  userId: string
  spaceId: string | null
  taskId: string | null
  note: string | null
  startedAt: string
  endedAt: string | null
  durationSec: number | null
  createdAt: string
  updatedAt: string
}

export interface TimeSummary {
  todaySec: number
  weekSec: number
  monthSec: number
  activeSince: string | null
}
