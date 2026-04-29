import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { RegisterSchema } from '@flou/shared'

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const parsed = RegisterSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? 'Validation error' },
      { status: 400 },
    )
  }

  const upstream = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
  })

  const data = await upstream.json()

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status })
  }

  forwardCookies(upstream, await cookies())

  return NextResponse.json(data, { status: 201 })
}

function forwardCookies(upstream: Response, jar: Awaited<ReturnType<typeof cookies>>) {
  upstream.headers.getSetCookie?.().forEach((raw) => {
    const [nameValue, ...directives] = raw.split(';').map((s) => s.trim())
    const [name, ...valueParts] = nameValue.split('=')
    const value = valueParts.join('=')

    const opts: Parameters<typeof jar.set>[2] = { path: '/' }
    directives.forEach((d) => {
      const lower = d.toLowerCase()
      if (lower === 'httponly') opts.httpOnly = true
      if (lower === 'secure') opts.secure = true
      if (lower.startsWith('max-age=')) opts.maxAge = parseInt(d.split('=')[1])
      if (lower.startsWith('samesite=')) opts.sameSite = d.split('=')[1].toLowerCase() as 'lax' | 'strict' | 'none'
    })

    jar.set(name, value, opts)
  })
}
