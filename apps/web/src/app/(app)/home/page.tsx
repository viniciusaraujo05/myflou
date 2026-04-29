import { cookies } from 'next/headers'
import type { Credential, Link, NoteSummary, Task, User } from '@flou/shared'
import { HomeView } from './home-view'

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function getData() {
  const jar = await cookies()
  const token = jar.get('access_token')?.value
  if (!token) return null

  try {
    const today = new Date().toISOString().slice(0, 10)
    const [userRes, tasksRes, notesRes, linksRes, credentialsRes] = await Promise.all([
      fetch(`${API}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }),
      fetch(`${API}/tasks?from=${today}&to=${today}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }),
      fetch(`${API}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }),
      fetch(`${API}/links`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }),
      fetch(`${API}/credentials`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }),
    ])

    if (!userRes.ok) return null
    const user: User = await userRes.json()
    const todaysTasks: Task[] = tasksRes.ok ? await tasksRes.json() : []
    const notes: NoteSummary[] = notesRes.ok ? await notesRes.json() : []
    const links: Link[] = linksRes.ok ? await linksRes.json() : []
    const credentials: Credential[] = credentialsRes.ok ? await credentialsRes.json() : []
    return { user, todaysTasks, notes, links, credentials }
  } catch {
    return null
  }
}

export default async function HomePage() {
  const data = await getData()
  if (!data) return null
  return (
    <HomeView
      user={data.user}
      initialTasks={data.todaysTasks}
      initialNotes={data.notes}
      initialLinks={data.links}
      initialCredentials={data.credentials}
    />
  )
}
