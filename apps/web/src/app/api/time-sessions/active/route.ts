import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function authHeader(): Promise<Record<string, string>> {
  const token = (await cookies()).get('access_token')?.value
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function GET() {
  const upstream = await fetch(`${API}/time-sessions/active`, { headers: await authHeader(), cache: 'no-store' })
  const data = await upstream.json()
  return NextResponse.json(data, { status: upstream.status })
}
