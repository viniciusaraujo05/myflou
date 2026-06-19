export interface SpaceProps {
  id: string
  userId: string
  name: string
  color: string
  icon: string | null
  order: number
  archived: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SpaceDTO {
  id: string
  userId: string
  name: string
  color: string
  icon: string | null
  order: number
  archived: boolean
  createdAt: string
  updatedAt: string
}

export class Space {
  private constructor(private readonly props: SpaceProps) {}

  static reconstitute(props: SpaceProps): Space {
    return new Space(props)
  }

  get id(): string { return this.props.id }
  get userId(): string { return this.props.userId }
  get name(): string { return this.props.name }
  get color(): string { return this.props.color }
  get icon(): string | null { return this.props.icon }
  get order(): number { return this.props.order }
  get archived(): boolean { return this.props.archived }
  get createdAt(): Date { return this.props.createdAt }
  get updatedAt(): Date { return this.props.updatedAt }

  toDTO(): SpaceDTO {
    return {
      id: this.props.id,
      userId: this.props.userId,
      name: this.props.name,
      color: this.props.color,
      icon: this.props.icon,
      order: this.props.order,
      archived: this.props.archived,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    }
  }
}
