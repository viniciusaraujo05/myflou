import { DomainError } from '../shared/domain-error.js'

export class SpaceNotFoundError extends DomainError {
  constructor() {
    super('Space not found', 'NOT_FOUND')
  }
}

export class SpaceAccessDeniedError extends DomainError {
  constructor() {
    super('You do not have permission to access this space', 'ACCESS_DENIED')
  }
}
