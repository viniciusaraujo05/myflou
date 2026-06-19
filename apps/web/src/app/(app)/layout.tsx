import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User, Space } from '@flou/shared'
import { AppShell } from '@/components/ui/app-shell'

const API =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3001'

async function fetchJson<T>(path: string, token: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get('access_token')?.value
  if (!token) redirect('/login')

  const user = await fetchJson<User>('/users/me', token)
  if (!user) redirect('/login')

  const spaces = (await fetchJson<Space[]>('/spaces', token)) ?? []

  return <AppShell user={user} spaces={spaces}>{children}</AppShell>
}
