import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function authHeader(): Promise<Record<string, string>> {
  const token = (await cookies()).get('access_token')?.value
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// GET /api/tasks?from=YYYY-MM-DD&to=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const space = searchParams.get('space')

  const qs = new URLSearchParams()
  if (from) qs.set('from', from)
  if (to) qs.set('to', to)
  if (space) qs.set('space', space)

  const upstream = await fetch(`${API}/tasks?${qs}`, {
    headers: { ...(await authHeader()) },
    cache: 'no-store',
  })

  const data = await upstream.json()
  return NextResponse.json(data, { status: upstream.status })
}

// POST /api/tasks
export async function POST(req: NextRequest) {
  const body = await req.json()

  const upstream = await fetch(`${API}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify(body),
  })

  const data = await upstream.json()
  return NextResponse.json(data, { status: upstream.status })
}
