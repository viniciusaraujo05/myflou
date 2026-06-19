import { NextRequest, NextResponse } from 'next/server'

const PROTECTED = ['/home', '/inbox', '/tasks', '/calendar', '/notes', '/links', '/passwords', '/finance', '/space', '/profile', '/preferences']
const AUTH_ONLY  = ['/login', '/register']

const API_URL =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3001'

// ── JWT helpers (Edge Runtime — no crypto module, use atob) ───────────────

function getTokenExp(token: string): number | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3 || !parts[1]) return null
    // base64url → base64
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '='))
    const { exp } = JSON.parse(json)
    return typeof exp === 'number' ? exp : null
  } catch {
    return null
  }
}

/** True when token is missing, invalid, or expires within 60 s */
function isExpired(token: string | undefined): boolean {
  if (!token) return true
  const exp = getTokenExp(token)
  if (exp === null) return true
  return exp < Math.floor(Date.now() / 1000) + 60
}

// ── Token refresh ─────────────────────────────────────────────────────────

interface TokenPair { accessToken: string; refreshToken: string }

async function tryRefresh(refreshToken: string): Promise<TokenPair | null> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: `refresh_token=${refreshToken}` },
    })
    if (!res.ok) return null

    const list: string[] =
      typeof res.headers.getSetCookie === 'function'
        ? res.headers.getSetCookie()
        : [res.headers.get('set-cookie') ?? ''].filter(Boolean)

    let newAccess: string | null  = null
    let newRefresh: string | null = null

    for (const raw of list) {
      const [nameValue] = raw.split(';')
      const eq = nameValue.indexOf('=')
      if (eq === -1) continue
      const name  = nameValue.slice(0, eq).trim()
      const value = nameValue.slice(eq + 1).trim()
      if (name === 'access_token')  newAccess  = value
      if (name === 'refresh_token') newRefresh = value
    }

    if (!newAccess || !newRefresh) return null
    return { accessToken: newAccess, refreshToken: newRefresh }
  } catch {
    return null
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────

const IS_PROD   = process.env.NODE_ENV === 'production'
const COOKIE_BASE = { httpOnly: true, sameSite: 'lax' as const, path: '/', secure: IS_PROD }
const ACCESS_OPTS  = { ...COOKIE_BASE, maxAge: 60 * 60 }          // 1 h
const REFRESH_OPTS = { ...COOKIE_BASE, maxAge: 7 * 24 * 60 * 60 } // 7 d

function redirectToLogin(req: NextRequest, from: string): NextResponse {
  const url = req.nextUrl.clone()
  url.pathname = '/login'
  url.searchParams.set('from', from)
  return NextResponse.redirect(url)
}

function buildResponse(req: NextRequest, tokens: TokenPair, redirectTo?: string): NextResponse {
  // Forward fresh cookies to the current route handler via the request headers
  const preserved = req.cookies
    .getAll()
    .filter(c => c.name !== 'access_token' && c.name !== 'refresh_token')
    .map(c => `${c.name}=${c.value}`)
    .join('; ')

  const cookieHeader = [
    `access_token=${tokens.accessToken}`,
    `refresh_token=${tokens.refreshToken}`,
    preserved,
  ].filter(Boolean).join('; ')

  const fwdHeaders = new Headers(req.headers)
  fwdHeaders.set('cookie', cookieHeader)

  const res = redirectTo
    ? NextResponse.redirect(new URL(redirectTo, req.url))
    : NextResponse.next({ request: { headers: fwdHeaders } })

  res.cookies.set('access_token',  tokens.accessToken,  ACCESS_OPTS)
  res.cookies.set('refresh_token', tokens.refreshToken, REFRESH_OPTS)
  return res
}

// ── Main ──────────────────────────────────────────────────────────────────

async function handler(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl

  const accessToken  = req.cookies.get('access_token')?.value
  const refreshToken = req.cookies.get('refresh_token')?.value

  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  const isAuthOnly  = AUTH_ONLY.some(p => pathname.startsWith(p))
  const isTasksApi  = pathname.startsWith('/api/tasks')

  const validToken = !isExpired(accessToken)

  // ── Auth-only: redirect to /home if already logged in ────────────
  if (isAuthOnly) {
    if (validToken) return NextResponse.redirect(new URL('/home', req.url))
    if (refreshToken) {
      const tokens = await tryRefresh(refreshToken)
      if (tokens) return buildResponse(req, tokens, '/home')
    }
    return NextResponse.next()
  }

  // ── Routes that require a session ────────────────────────────────
  if (isProtected || isTasksApi) {
    if (validToken) return NextResponse.next()

    if (refreshToken) {
      const tokens = await tryRefresh(refreshToken)
      if (tokens) return buildResponse(req, tokens)
    }

    // No valid session at all
    if (isProtected) return redirectToLogin(req, pathname)

    // For /api/tasks: let the route handler return 401 naturally
    return NextResponse.next()
  }

  return NextResponse.next()
}

// Wrap in try/catch so a middleware crash never causes a 500
export async function middleware(req: NextRequest): Promise<NextResponse> {
  try {
    return await handler(req)
  } catch (err) {
    console.error('[middleware] Unexpected error:', err)
    return NextResponse.next()
  }
}

export const config = {
  // Exclude static assets and auth API routes; include everything else
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|api/auth).*)'],
}
