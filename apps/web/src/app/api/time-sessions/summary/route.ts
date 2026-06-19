import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function authHeader(): Promise<Record<string, string>> {
  const token = (await cookies()).get('access_token')?.value
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function GET(req: NextRequest) {
  const space = new URL(req.url).searchParams.get('space')
  const suffix = space ? `?space=${space}` : ''
  const upstream = await fetch(`${API}/time-sessions/summary${suffix}`, { headers: await authHeader(), cache: 'no-store' })
  const data = await upstream.json()
  return NextResponse.json(data, { status: upstream.status })
}
