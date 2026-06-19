import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function authHeader(): Promise<Record<string, string>> {
  const token = (await cookies()).get('access_token')?.value
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const qs = new URLSearchParams()
  const space = searchParams.get('space')
  const limit = searchParams.get('limit')
  if (space) qs.set('space', space)
  if (limit) qs.set('limit', limit)
  const suffix = qs.toString() ? `?${qs}` : ''
  const upstream = await fetch(`${API}/activity${suffix}`, { headers: await authHeader(), cache: 'no-store' })
  const data = await upstream.json()
  return NextResponse.json(data, { status: upstream.status })
}
