export class DomainError extends Error {
  /** Discriminator — use this instead of instanceof for cross-module safety */
  readonly isDomainError = true as const

  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message)
    this.name = 'DomainError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export function isDomainError(err: unknown): err is DomainError {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as DomainError).isDomainError === true
  )
}

export class NotFoundError extends DomainError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND')
  }
}

export class AccessDeniedError extends DomainError {
  constructor() {
    super('You do not have permission to access this resource', 'ACCESS_DENIED')
  }
}

export class InvalidRelationError extends DomainError {
  constructor(resource = 'Related resource') {
    super(`${resource} is invalid`, 'INVALID_RELATION')
  }
}
