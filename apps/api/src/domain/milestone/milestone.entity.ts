export type MilestoneStatus = 'PLANNED' | 'IN_PROGRESS' | 'DONE'

export interface MilestoneProps {
  id: string
  userId: string
  spaceId: string | null
  title: string
  description: string | null
  status: MilestoneStatus
  targetDate: Date | null
  order: number
  taskCount: number
  completedCount: number
  createdAt: Date
  updatedAt: Date
}

export interface MilestoneDTO {
  id: string
  userId: string
  spaceId: string | null
  title: string
  description: string | null
  status: MilestoneStatus
  targetDate: string | null // YYYY-MM-DD
  order: number
  taskCount: number
  completedCount: number
  createdAt: string
  updatedAt: string
}

export class Milestone {
  private constructor(private readonly props: MilestoneProps) {}

  static reconstitute(props: MilestoneProps): Milestone {
    return new Milestone(props)
  }

  get id(): string { return this.props.id }
  get userId(): string { return this.props.userId }
  get spaceId(): string | null { return this.props.spaceId }
  get status(): MilestoneStatus { return this.props.status }

  toDTO(): MilestoneDTO {
    return {
      id: this.props.id,
      userId: this.props.userId,
      spaceId: this.props.spaceId,
      title: this.props.title,
      description: this.props.description,
      status: this.props.status,
      targetDate: this.props.targetDate ? this.props.targetDate.toISOString().slice(0, 10) : null,
      order: this.props.order,
      taskCount: this.props.taskCount,
      completedCount: this.props.completedCount,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    }
  }
}
