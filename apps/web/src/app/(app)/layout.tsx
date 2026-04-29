import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User } from '@flou/shared'
import { AppShell } from '@/components/ui/app-shell'

const API =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3001'

async function getUser(): Promise<User | null> {
  const token = (await cookies()).get('access_token')?.value
  if (!token) return null
  try {
    const res = await fetch(`${API}/users/me`, {
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
  const user = await getUser()
  if (!user) redirect('/login')

  return <AppShell user={user}>{children}</AppShell>
}
