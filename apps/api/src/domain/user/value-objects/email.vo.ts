import { z } from 'zod'
import { DomainError } from '../../shared/domain-error.js'

const EmailSchema = z.string().email()

export class InvalidEmailError extends DomainError {
  constructor(raw: string) {
    super(`"${raw}" is not a valid email address`, 'INVALID_EMAIL')
  }
}

export class Email {
  private constructor(public readonly value: string) {}

  static create(raw: string): Email {
    const result = EmailSchema.safeParse(raw)
    if (!result.success) throw new InvalidEmailError(raw)
    return new Email(result.data.toLowerCase().trim())
  }

  equals(other: Email): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
