import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { DomainError } from '../../shared/domain-error.js'

const PasswordRules = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

export class WeakPasswordError extends DomainError {
  constructor(reason: string) {
    super(reason, 'WEAK_PASSWORD')
  }
}

const BCRYPT_COST = 12

export class HashedPassword {
  private constructor(private readonly hash: string) {}

  /**
   * Creates a HashedPassword from a plain-text password.
   * Validates password strength with Zod before hashing.
   */
  static async fromPlain(plain: string): Promise<HashedPassword> {
    const result = PasswordRules.safeParse(plain)
    if (!result.success) {
      throw new WeakPasswordError(result.error.issues[0]?.message ?? 'Password is too weak')
    }
    const hash = await bcrypt.hash(plain, BCRYPT_COST)
    return new HashedPassword(hash)
  }

  /**
   * Wraps an already-hashed value (e.g., loaded from the database).
   */
  static fromHash(hash: string): HashedPassword {
    return new HashedPassword(hash)
  }

  /**
   * Timing-safe comparison against a plain-text candidate.
   */
  async compare(plain: string): Promise<boolean> {
    return bcrypt.compare(plain, this.hash)
  }

  get value(): string {
    return this.hash
  }
}
