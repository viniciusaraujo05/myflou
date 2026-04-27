/**
 * Server-side API client — calls Fastify directly using the access token from cookies.
 * Use this only in Server Components and API Route handlers.
 * Client Components should call the Next.js /api/* BFF routes instead.
 */
import type { User } from '@flou/shared'

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function getUser(accessToken: string): Promise<User | null> {
  const res = await fetch(`${API}/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })
  if (!res.ok) return null
  return res.json()
}
