import { DomainError } from '../shared/domain-error.js'

export class EmailAlreadyInUseError extends DomainError {
  constructor() {
    super('Email already in use', 'EMAIL_ALREADY_IN_USE')
  }
}

export class UserNotFoundError extends DomainError {
  constructor() {
    super('User not found', 'USER_NOT_FOUND')
  }
}

export class InvalidCurrentPasswordError extends DomainError {
  constructor() {
    super('Current password is incorrect', 'INVALID_CURRENT_PASSWORD')
  }
}

export class NoPasswordSetError extends DomainError {
  constructor() {
    super('No password set — use your social login or set a password first', 'NO_PASSWORD_SET')
  }
}
