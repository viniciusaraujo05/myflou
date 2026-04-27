export interface TokenPayload {
  sub: string
  email: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string // raw (unhashed) — send to client, store hash in DB
}

export interface ITokenService {
  signAccessToken(payload: TokenPayload): string
  verifyAccessToken(token: string): TokenPayload
  generateRefreshToken(): string
}
