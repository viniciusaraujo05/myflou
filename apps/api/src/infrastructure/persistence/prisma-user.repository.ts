import type { PrismaClient } from '@prisma/client'
import { User, type StatusRecord } from '../../domain/user/user.entity.js'
import { Email } from '../../domain/user/value-objects/email.vo.js'
import { HashedPassword } from '../../domain/user/value-objects/password.vo.js'
import type { IUserRepository } from '../../domain/user/user.repository.js'

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } })
    return record ? this.toEntity(record) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { email } })
    return record ? this.toEntity(record) : null
  }

  async create(email: Email, password: HashedPassword): Promise<User> {
    const record = await this.prisma.user.create({
      data: { email: email.value, password: password.value },
    })
    return this.toEntity(record)
  }

  async incrementFailedAttempts(userId: string, lockedUntil: Date | null): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: { increment: 1 }, lockedUntil },
    })
  }

  async resetFailedAttempts(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    })
  }

  async setStatuses(userId: string, statuses: StatusRecord[]): Promise<User> {
    const record = await this.prisma.user.update({
      where: { id: userId },
      data: { statuses: statuses as object[] },
    })
    return this.toEntity(record)
  }

  private toEntity(record: {
    id: string
    email: string
    password: string
    failedLoginAttempts: number
    lockedUntil: Date | null
    statuses: unknown
    createdAt: Date
    updatedAt: Date
  }): User {
    const statuses = Array.isArray(record.statuses)
      ? (record.statuses as StatusRecord[])
      : []
    return User.reconstitute({
      id: record.id,
      email: Email.create(record.email),
      password: HashedPassword.fromHash(record.password),
      failedLoginAttempts: record.failedLoginAttempts,
      lockedUntil: record.lockedUntil,
      statuses,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    })
  }
}
