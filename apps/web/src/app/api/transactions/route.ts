import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function authHeader(): Promise<Record<string, string>> {
  const token = (await cookies()).get('access_token')?.value
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const space = searchParams.get('space')

  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  if (space) params.set('space', space)
  const query = params.toString() ? `?${params}` : ''

  const upstream = await fetch(`${API}/transactions${query}`, {
    headers: { ...(await authHeader()) },
    cache: 'no-store',
  })
  return NextResponse.json(await upstream.json(), { status: upstream.status })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const upstream = await fetch(`${API}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify(body),
  })
  return NextResponse.json(await upstream.json(), { status: upstream.status })
}
