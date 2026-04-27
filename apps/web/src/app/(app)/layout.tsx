import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User } from '@flou/shared'
import { SidebarNav, BottomNav } from '@/components/ui/app-nav'
import { UserMenu } from '@/components/ui/user-menu'
import { CaptureButton } from '@/components/capture/capture-button'

const API =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3001'

async function getUser(): Promise<User | null> {
  const token = cookies().get('access_token')?.value
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

  return (
    <>
      <div className="flex h-screen bg-[var(--bg)] p-3">

        {/* ── Desktop sidebar ── */}
        <aside
          className="hidden lg:flex w-[180px] shrink-0 flex-col rounded-2xl"
          style={{ background: 'var(--bg2)', padding: '20px 12px', marginRight: 12 }}
        >
          {/* Logo */}
          <div className="mb-7 flex items-center gap-2 px-1.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px]"
              style={{ background: 'var(--accent)' }}>
              <span className="font-serif italic text-[12px] font-medium text-white"
                style={{ letterSpacing: '-0.5px' }}>fl</span>
            </div>
            <span className="font-serif text-[14px] font-medium"
              style={{ color: 'var(--text)', letterSpacing: '-0.3px' }}>flou</span>
          </div>

          <SidebarNav />

          <div className="flex-1" />

          <UserMenu user={user} />
        </aside>

        {/* ── Main content column ── */}
        <div className="flex min-w-0 flex-1 flex-col">

          {/* Mobile top bar */}
          <header className="mb-3 flex shrink-0 items-center justify-between lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-[9px]"
                style={{ background: 'var(--accent)' }}>
                <span className="font-serif italic text-[12px] font-medium text-white"
                  style={{ letterSpacing: '-0.5px' }}>fl</span>
              </div>
              <span className="font-serif text-[14px] font-medium"
                style={{ color: 'var(--text)', letterSpacing: '-0.3px' }}>flou</span>
            </div>
            <UserMenu user={user} compact />
          </header>

          {/* Page content */}
          <div className="flex min-h-0 flex-1 gap-3 overflow-hidden pb-16 lg:pb-0">
            {children}
          </div>

        </div>
      </div>

      {/* Mobile bottom nav — fixed, rendered once, outside the layout box */}
      <BottomNav />

      {/* AI capture button — fixed bottom-right, accessible from any page */}
      <CaptureButton />
    </>
  )
}
