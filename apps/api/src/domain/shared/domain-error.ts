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
