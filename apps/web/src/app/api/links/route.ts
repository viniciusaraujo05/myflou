import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function authHeader(): Promise<Record<string, string>> {
  const token = (await cookies()).get('access_token')?.value
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const categoryId = searchParams.get('categoryId')
  const qs = categoryId ? `?categoryId=${categoryId}` : ''
  const upstream = await fetch(`${API}/links${qs}`, { headers: await authHeader(), cache: 'no-store' })
  const data = await upstream.json()
  return NextResponse.json(data, { status: upstream.status })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const upstream = await fetch(`${API}/links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify(body),
  })
  const data = await upstream.json()
  return NextResponse.json(data, { status: upstream.status })
}
