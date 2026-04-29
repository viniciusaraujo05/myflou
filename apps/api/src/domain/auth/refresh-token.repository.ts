export interface RefreshTokenRecord {
  id: string
  tokenHash: string
  userId: string
  userEmail: string
  expiresAt: Date
  absoluteExpiresAt: Date
  family: string
}

export interface IRefreshTokenRepository {
  create(
    userId: string,
    tokenHash: string,
    tokenPrefix: string,
    expiresAt: Date,
    absoluteExpiresAt: Date,
    family: string,
  ): Promise<void>
  findByPrefix(prefix: string): Promise<RefreshTokenRecord[]>
  deleteById(id: string): Promise<void>
  deleteExpired(now: Date): Promise<void>
  deleteAllByFamily(family: string): Promise<void>
}
