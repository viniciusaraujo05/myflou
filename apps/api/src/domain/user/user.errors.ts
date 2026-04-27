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
