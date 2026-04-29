import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function POST() {
  const jar = await cookies()
  const accessToken  = jar.get('access_token')?.value
  const refreshToken = jar.get('refresh_token')?.value

  // Always clear local cookies first so the user is logged out
  // regardless of whether the API call succeeds.
  jar.delete('access_token')
  jar.delete('refresh_token')

  // Tell the API to invalidate the refresh token in the database.
  // We still attempt this even after clearing local cookies.
  if (refreshToken) {
    try {
      await fetch(`${API}/auth/logout`, {
        method: 'POST',
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          Cookie: [
            accessToken  && `access_token=${accessToken}`,
            refreshToken && `refresh_token=${refreshToken}`,
          ].filter(Boolean).join('; '),
        },
      })
    } catch {
      // API unreachable — cookies already cleared, user is locally logged out.
      // The refresh token will expire naturally in 7 days.
      console.warn('[logout] Could not reach API to invalidate refresh token')
    }
  }

  return NextResponse.json({ ok: true })
}
