import { Google, generateCodeVerifier, generateState } from 'arctic'
import { NextRequest, NextResponse } from 'next/server'

const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  process.env.GOOGLE_REDIRECT_URI!,
)

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 600,
  path: '/',
  sameSite: 'lax',
} as const

export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get('from') ?? '/home'
  const state = generateState()
  const codeVerifier = generateCodeVerifier()

  const url = google.createAuthorizationURL(state, codeVerifier, ['openid', 'email', 'profile'])

  // Set cookies directly on the redirect response — more reliable than cookies().set()
  const response = NextResponse.redirect(url)
  response.cookies.set('google_oauth_state',   state,        COOKIE_OPTS)
  response.cookies.set('google_code_verifier', codeVerifier, COOKIE_OPTS)
  response.cookies.set('google_redirect_to',   from,         COOKIE_OPTS)

  return response
}
