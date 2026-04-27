import type { PrismaClient } from '@prisma/client'
import { Credential } from '../../domain/credential/credential.entity.js'
import type { ICredentialRepository } from '../../domain/credential/credential.repository.js'
import { encrypt, decrypt } from '../crypto/encryption.service.js'

type CredentialRow = {
  id: string; userId: string; service: string
  username: string; password: string
  url: string | null; notes: string | null
  createdAt: Date; updatedAt: Date
}

function encryptRow(data: { username: string; password: string }) {
  return { username: encrypt(data.username), password: encrypt(data.password) }
}

function toEntity(r: CredentialRow): Credential {
  return Credential.reconstitute({
    ...r,
    username: decrypt(r.username),
    password: decrypt(r.password),
  })
}

export class PrismaCredentialRepository implements ICredentialRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(userId: string, data: { service: string; username: string; password: string; url?: string | null; notes?: string | null }): Promise<Credential> {
    const r = await this.prisma.credential.create({
      data: {
        userId,
        service: data.service,
        ...encryptRow({ username: data.username, password: data.password }),
        url: data.url ?? null,
        notes: data.notes ?? null,
      },
    })
    return toEntity(r)
  }

  async findByUser(userId: string): Promise<Credential[]> {
    const rows = await this.prisma.credential.findMany({ where: { userId }, orderBy: { service: 'asc' } })
    return rows.map(toEntity)
  }

  async findById(id: string): Promise<Credential | null> {
    const r = await this.prisma.credential.findUnique({ where: { id } })
    return r ? toEntity(r) : null
  }

  async update(id: string, data: { service?: string; username?: string; password?: string; url?: string | null; notes?: string | null }): Promise<Credential> {
    const encrypted: Record<string, unknown> = { ...data }
    if (data.username !== undefined) encrypted.username = encrypt(data.username)
    if (data.password !== undefined) encrypted.password = encrypt(data.password)
    const r = await this.prisma.credential.update({ where: { id }, data: encrypted })
    return toEntity(r)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.credential.delete({ where: { id } })
  }
}
