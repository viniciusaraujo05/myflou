import type { Credential } from './credential.entity.js'
export interface ICredentialRepository {
  create(userId: string, data: { service: string; username: string; password: string; url?: string | null; notes?: string | null; spaceId?: string | null }): Promise<Credential>
  findByUser(userId: string, spaceId?: string): Promise<Credential[]>
  findById(id: string): Promise<Credential | null>
  update(id: string, data: { service?: string; username?: string; password?: string; url?: string | null; notes?: string | null; spaceId?: string | null }, userId: string): Promise<Credential>
  delete(id: string, userId: string): Promise<void>
}
