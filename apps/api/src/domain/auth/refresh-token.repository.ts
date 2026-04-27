export interface RefreshTokenRecord {
  id: string
  tokenHash: string
  userId: string
  userEmail: string
  expiresAt: Date
}

export interface IRefreshTokenRepository {
  create(userId: string, tokenHash: string, tokenPrefix: string, expiresAt: Date): Promise<void>
  findByPrefix(prefix: string): Promise<RefreshTokenRecord[]>
  deleteById(id: string): Promise<void>
}
