import type { Status } from './status'

export interface User {
  id: string
  email: string
  name: string | null
  hasPassword: boolean
  statuses: Status[]
  createdAt: string
}

export interface AuthResponse {
  user: User
  // token is set as httpOnly cookie by the server; not in response body
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface ApiError {
  statusCode: number
  message: string
  error?: string
}
