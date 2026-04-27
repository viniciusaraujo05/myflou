import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function GET() {
  const jar = cookies()
  const accessToken = jar.get('access_token')?.value

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const upstream = await fetch(`${API}/users/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  })

  const data = await upstream.json()

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status })
  }

  return NextResponse.json(data)
}
