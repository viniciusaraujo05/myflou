export interface TaskProps {
  id: string
  userId: string
  title: string
  date: Date
  completed: boolean
  description: string | null
  hoursSpent: number | null
  statusId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface TaskDTO {
  id: string
  userId: string
  title: string
  date: string   // ISO date string YYYY-MM-DD
  completed: boolean
  description: string | null
  hoursSpent: number | null
  statusId: string | null
  createdAt: string
  updatedAt: string
}

export class Task {
  private constructor(private readonly props: TaskProps) {}

  static reconstitute(props: TaskProps): Task {
    return new Task(props)
  }

  get id(): string { return this.props.id }
  get userId(): string { return this.props.userId }
  get title(): string { return this.props.title }
  get date(): Date { return this.props.date }
  get completed(): boolean { return this.props.completed }
  get description(): string | null { return this.props.description }
  get hoursSpent(): number | null { return this.props.hoursSpent }
  get statusId(): string | null { return this.props.statusId }
  get createdAt(): Date { return this.props.createdAt }
  get updatedAt(): Date { return this.props.updatedAt }

  toDTO(): TaskDTO {
    return {
      id: this.props.id,
      userId: this.props.userId,
      title: this.props.title,
      date: this.props.date.toISOString().slice(0, 10),
      completed: this.props.completed,
      description: this.props.description,
      hoursSpent: this.props.hoursSpent,
      statusId: this.props.statusId,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    }
  }
}
