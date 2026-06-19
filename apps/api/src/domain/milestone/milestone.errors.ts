import { DomainError } from '../shared/domain-error.js'

export class MilestoneNotFoundError extends DomainError {
  constructor() {
    super('Milestone not found', 'NOT_FOUND')
  }
}

export class MilestoneAccessDeniedError extends DomainError {
  constructor() {
    super('You do not have permission to access this milestone', 'ACCESS_DENIED')
  }
}
