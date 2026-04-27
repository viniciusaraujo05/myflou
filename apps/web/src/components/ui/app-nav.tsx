'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  {
    label: 'Home',
    href: '/home',
    exact: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor"
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <path d="M7 18v-7h6v7" />
      </svg>
    ),
  },
  {
    label: 'Calendar',
    href: '/calendar',
    exact: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor"
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="16" height="14" rx="3" />
        <path d="M2 8h16M6 2v4M14 2v4" />
        <circle cx="7" cy="13" r="1" fill="currentColor" />
        <circle cx="13" cy="13" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: 'Notes',
    href: '/notes',
    exact: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor"
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h12v9l-4 4H4V4z" />
        <path d="M12 13v4l4-4h-4M7 8h6M7 11h4" />
      </svg>
    ),
  },
  {
    label: 'Links',
    href: '/links',
    exact: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor"
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 12a4 4 0 006 0l2-2a4 4 0 00-6-6l-1 1" />
        <path d="M12 8a4 4 0 00-6 0L4 10a4 4 0 006 6l1-1" />
      </svg>
    ),
  },
  {
    label: 'Passwords',
    href: '/passwords',
    exact: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor"
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="9" width="14" height="9" rx="2" />
        <path d="M7 9V6a3 3 0 016 0v3" />
        <circle cx="10" cy="14" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
]

function useActiveItem() {
  const pathname = usePathname()
  return (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)
}

/** Desktop sidebar navigation — icon + label, vertical list */
export function SidebarNav() {
  const isActive = useActiveItem()
  return (
    <nav className="flex flex-col gap-0.5">
      <p className="mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-[0.15em]"
        style={{ color: 'var(--text3)' }}>
        Menu
      </p>
      {NAV_ITEMS.map(item => {
        const active = isActive(item.href, item.exact ?? false)
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium transition-all"
            style={{
              background: active ? 'var(--bg3)' : 'transparent',
              color: active ? 'var(--text)' : 'var(--text3)',
            }}
            onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.04)'; (e.currentTarget as HTMLElement).style.color = 'var(--text2)' } }}
            onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text3)' } }}
          >
            {item.icon}
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

/** Mobile bottom navigation — fixed, icon + label, horizontal */
export function BottomNav() {
  const isActive = useActiveItem()
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2 lg:hidden"
      style={{ background: 'var(--bg)', borderTop: '1px solid var(--divider)' }}
    >
      {NAV_ITEMS.map(item => {
        const active = isActive(item.href, item.exact ?? false)
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 px-3 py-1"
            style={{ color: active ? 'var(--accent)' : 'var(--text3)' }}
          >
            {item.icon}
            <span style={{ fontSize: 10, fontWeight: active ? 500 : 400 }}>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
