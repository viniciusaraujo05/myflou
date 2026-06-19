export interface TimeSessionProps {
  id: string
  userId: string
  spaceId: string | null
  taskId: string | null
  note: string | null
  startedAt: Date
  endedAt: Date | null
  durationSec: number | null
  createdAt: Date
  updatedAt: Date
}

export interface TimeSessionDTO {
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

export class TimeSession {
  private constructor(private readonly props: TimeSessionProps) {}

  static reconstitute(props: TimeSessionProps): TimeSession {
    return new TimeSession(props)
  }

  get id(): string { return this.props.id }
  get userId(): string { return this.props.userId }
  get startedAt(): Date { return this.props.startedAt }
  get isActive(): boolean { return this.props.endedAt === null }

  toDTO(): TimeSessionDTO {
    return {
      id: this.props.id,
      userId: this.props.userId,
      spaceId: this.props.spaceId,
      taskId: this.props.taskId,
      note: this.props.note,
      startedAt: this.props.startedAt.toISOString(),
      endedAt: this.props.endedAt ? this.props.endedAt.toISOString() : null,
      durationSec: this.props.durationSec,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    }
  }
}
