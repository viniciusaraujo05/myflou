import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function authHeader(): Record<string, string> {
  const token = cookies().get('access_token')?.value
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const upstream = await fetch(`${API}/ai/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(body),
  })
  const data = await upstream.json()
  return NextResponse.json(data, { status: upstream.status })
}
