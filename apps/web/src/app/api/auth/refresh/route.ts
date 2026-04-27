import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const ALLOWED_SAME_SITE = new Set(['lax', 'strict', 'none'])

function forwardCookies(upstream: Response, jar: ReturnType<typeof cookies>) {
  const setCookies =
    typeof upstream.headers.getSetCookie === 'function'
      ? upstream.headers.getSetCookie()
      : [upstream.headers.get('set-cookie') ?? ''].filter(Boolean)

  for (const raw of setCookies) {
    const [nameValue, ...directives] = raw.split(';').map(s => s.trim())
    const eq = nameValue.indexOf('=')
    if (eq === -1) continue

    const name  = nameValue.slice(0, eq).trim()
    const value = nameValue.slice(eq + 1).trim()
    if (!name) continue

    const opts: Parameters<typeof jar.set>[2] = { path: '/' }
    for (const d of directives) {
      const lower = d.toLowerCase()
      if (lower === 'httponly') { opts.httpOnly = true; continue }
      if (lower === 'secure')   { opts.secure   = true; continue }
      if (lower.startsWith('max-age=')) {
        const age = parseInt(lower.slice(8), 10)
        if (!isNaN(age)) opts.maxAge = age
        continue
      }
      if (lower.startsWith('samesite=')) {
        const val = lower.slice(9)
        if (ALLOWED_SAME_SITE.has(val)) opts.sameSite = val as 'lax' | 'strict' | 'none'
        continue
      }
    }
    jar.set(name, value, opts)
  }
}

export async function POST() {
  const jar = cookies()
  const refreshToken = jar.get('refresh_token')?.value

  if (!refreshToken) {
    return NextResponse.json({ message: 'No refresh token' }, { status: 401 })
  }

  const upstream = await fetch(`${API}/auth/refresh`, {
    method: 'POST',
    headers: { Cookie: `refresh_token=${refreshToken}` },
  })

  if (!upstream.ok) {
    // Refresh token is invalid or expired — clear cookies
    jar.delete('access_token')
    jar.delete('refresh_token')
    return NextResponse.json({ message: 'Session expired' }, { status: 401 })
  }

  forwardCookies(upstream, jar)
  return NextResponse.json({ ok: true })
}
