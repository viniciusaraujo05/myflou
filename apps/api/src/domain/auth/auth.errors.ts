import { DomainError } from '../shared/domain-error.js'

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Invalid credentials', 'INVALID_CREDENTIALS')
  }
}

export class InvalidTokenError extends DomainError {
  constructor() {
    super('Invalid or expired token', 'INVALID_TOKEN')
  }
}

export class MissingTokenError extends DomainError {
  constructor() {
    super('Authentication token is required', 'MISSING_TOKEN')
  }
}

export class AccountLockedError extends DomainError {
  constructor(public readonly retryAfter: Date) {
    super('Account temporarily locked due to too many failed login attempts', 'ACCOUNT_LOCKED')
  }
}
