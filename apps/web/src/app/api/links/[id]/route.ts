import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function authHeader(): Record<string, string> {
  const token = cookies().get('access_token')?.value
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const upstream = await fetch(`${API}/links/${params.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(body),
  })
  const data = await upstream.json()
  return NextResponse.json(data, { status: upstream.status })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const upstream = await fetch(`${API}/links/${params.id}`, {
    method: 'DELETE',
    headers: authHeader(),
  })
  if (upstream.status === 204) return new NextResponse(null, { status: 204 })
  const data = await upstream.json()
  return NextResponse.json(data, { status: upstream.status })
}
