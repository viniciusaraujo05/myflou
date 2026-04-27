import { DomainError } from '../shared/domain-error.js'

export class TaskNotFoundError extends DomainError {
  constructor() {
    super('Task not found', 'TASK_NOT_FOUND')
  }
}

export class TaskAccessDeniedError extends DomainError {
  constructor() {
    super('You do not have permission to access this task', 'TASK_ACCESS_DENIED')
  }
}
