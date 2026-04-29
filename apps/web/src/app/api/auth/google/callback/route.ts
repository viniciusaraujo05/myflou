import { Google } from 'arctic'
import { NextRequest, NextResponse } from 'next/server'

const API     = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  process.env.GOOGLE_REDIRECT_URI!,
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')

  const storedState  = req.cookies.get('google_oauth_state')?.value
  const codeVerifier = req.cookies.get('google_code_verifier')?.value
  const redirectTo   = req.cookies.get('google_redirect_to')?.value ?? '/home'

  const fail = NextResponse.redirect(`${APP_URL}/login?error=oauth_failed`)

  // Validate CSRF state
  if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
    return fail
  }

  try {
    // Exchange code for Google tokens
    const tokens = await google.validateAuthorizationCode(code, codeVerifier)

    // Get verified user info from Google
    const googleUserRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokens.accessToken()}` },
    })
    if (!googleUserRes.ok) return fail

    const googleUser = await googleUserRes.json() as { sub: string; email: string; name?: string }

    // Call Fastify to create/find user and issue JWT tokens
    const upstream = await fetch(`${API}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ googleId: googleUser.sub, email: googleUser.email, name: googleUser.name }),
    })
    if (!upstream.ok) return fail

    // Redirect to destination and forward the JWT cookies from Fastify
    const response = NextResponse.redirect(`${APP_URL}${redirectTo}`)
    upstream.headers.getSetCookie?.().forEach((raw) => {
      response.headers.append('Set-Cookie', raw)
    })

    // Clear temporary OAuth cookies
    response.cookies.delete('google_oauth_state')
    response.cookies.delete('google_code_verifier')
    response.cookies.delete('google_redirect_to')

    return response
  } catch (err) {
    console.error('[google/callback]', err)
    return fail
  }
}
