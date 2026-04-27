import type { Credential } from './credential.entity.js'
export interface ICredentialRepository {
  create(userId: string, data: { service: string; username: string; password: string; url?: string | null; notes?: string | null }): Promise<Credential>
  findByUser(userId: string): Promise<Credential[]>
  findById(id: string): Promise<Credential | null>
  update(id: string, data: { service?: string; username?: string; password?: string; url?: string | null; notes?: string | null }): Promise<Credential>
  delete(id: string): Promise<void>
}
