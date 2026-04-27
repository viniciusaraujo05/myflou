import { cookies } from 'next/headers'
import type { User, Task } from '@flou/shared'
import { HomeView } from './home-view'

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function getData() {
  const jar = cookies()
  const token = jar.get('access_token')?.value
  if (!token) return null

  try {
    const today = new Date().toISOString().slice(0, 10)
    const [userRes, tasksRes] = await Promise.all([
      fetch(`${API}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }),
      fetch(`${API}/tasks?from=${today}&to=${today}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }),
    ])

    if (!userRes.ok) return null
    const user: User = await userRes.json()
    const todaysTasks: Task[] = tasksRes.ok ? await tasksRes.json() : []
    return { user, todaysTasks }
  } catch {
    return null
  }
}

export default async function HomePage() {
  const data = await getData()
  if (!data) return null
  return <HomeView user={data.user} initialTasks={data.todaysTasks} />
}
