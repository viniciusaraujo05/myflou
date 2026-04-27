import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { LoginSchema } from '@flou/shared'

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const parsed = LoginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.errors[0]?.message ?? 'Validation error' },
      { status: 400 },
    )
  }

  const upstream = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
  })

  const data = await upstream.json()

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status })
  }

  // Forward httpOnly cookies set by Fastify to the browser
  forwardCookies(upstream, cookies())

  return NextResponse.json(data, { status: 200 })
}

const ALLOWED_SAME_SITE = new Set(['lax', 'strict', 'none'])

function forwardCookies(upstream: Response, jar: ReturnType<typeof cookies>) {
  upstream.headers.getSetCookie?.().forEach((raw) => {
    const [nameValue, ...directives] = raw.split(';').map((s) => s.trim())
    const eqIdx = nameValue.indexOf('=')
    if (eqIdx === -1) return  // malformed — skip

    const name = nameValue.slice(0, eqIdx).trim()
    const value = nameValue.slice(eqIdx + 1).trim()
    if (!name) return

    const opts: Parameters<typeof jar.set>[2] = { path: '/' }
    for (const d of directives) {
      const lower = d.toLowerCase()
      if (lower === 'httponly') { opts.httpOnly = true; continue }
      if (lower === 'secure') { opts.secure = true; continue }
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
  })
}
