'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSpaces } from '@/components/spaces/space-context'
import { SpaceFormDialog } from '@/components/spaces/space-form-dialog'

type IconKey = 'home' | 'inbox' | 'tasks' | 'calendar' | 'notes' | 'links' | 'passwords' | 'finance' | 'profile' | 'preferences'

const ICONS: Record<IconKey, React.ReactNode> = {
  home: <path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z M7 18v-7h6v7" />,
  inbox: <path d="M3 11h4l1.5 3h3L13 11h4 M3 11l2.5-6h9L17 11v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" />,
  tasks: <path d="M4 6h12 M4 10h12 M4 14h8 M2.5 6l.7.7L4.6 5" />,
  calendar: <><rect x="2" y="4" width="16" height="14" rx="3" /><path d="M2 8h16M6 2v4M14 2v4" /></>,
  notes: <path d="M4 4h12v9l-4 4H4V4z M12 13v4l4-4h-4M7 8h6M7 11h4" />,
  links: <path d="M8 12a4 4 0 006 0l2-2a4 4 0 00-6-6l-1 1 M12 8a4 4 0 00-6 0L4 10a4 4 0 006 6l1-1" />,
  passwords: <><rect x="3" y="9" width="14" height="9" rx="2" /><path d="M7 9V6a3 3 0 016 0v3" /></>,
  finance: <><circle cx="10" cy="10" r="7" /><path d="M10 6.5v7M7.5 8.5C7.5 7.4 8.6 6.5 10 6.5s2.5.9 2.5 2c0 2.5-5 2.5-5 5 0 1.1 1.1 2 2.5 2s2.5-.9 2.5-2" /></>,
  profile: <><circle cx="10" cy="7" r="3" /><path d="M4 17c0-3 2.7-5 6-5s6 2 6 5" /></>,
  preferences: <><circle cx="10" cy="10" r="2.5" /><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M15.8 4.2l-1.4 1.4M5.6 14.4l-1.4 1.4" /></>,
}

function Icon({ name }: { name: IconKey }) {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </svg>
  )
}

interface NavItem { label: string; href: string; icon: IconKey; exact?: boolean }

const VIEW_ITEMS: NavItem[] = [
  { label: 'Home', href: '/home', icon: 'home', exact: true },
  { label: 'Inbox', href: '/inbox', icon: 'inbox' },
  { label: 'Tasks', href: '/tasks', icon: 'tasks' },
  { label: 'Calendar', href: '/calendar', icon: 'calendar' },
  { label: 'Notes', href: '/notes', icon: 'notes' },
  { label: 'Links', href: '/links', icon: 'links' },
  { label: 'Passwords', href: '/passwords', icon: 'passwords' },
  { label: 'Finance', href: '/finance', icon: 'finance' },
]

const SETTINGS_ITEMS: NavItem[] = [
  { label: 'Profile', href: '/profile', icon: 'profile' },
  { label: 'Preferences', href: '/preferences', icon: 'preferences' },
]

// Mobile bottom bar shows a focused subset of the global views.
const BOTTOM_ITEMS: NavItem[] = [
  { label: 'Home', href: '/home', icon: 'home', exact: true },
  { label: 'Inbox', href: '/inbox', icon: 'inbox' },
  { label: 'Tasks', href: '/tasks', icon: 'tasks' },
  { label: 'Notes', href: '/notes', icon: 'notes' },
  { label: 'Finance', href: '/finance', icon: 'finance' },
]

function useActiveItem() {
  const pathname = usePathname()
  return (href: string, exact = false) => (exact ? pathname === href : pathname.startsWith(href))
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 mt-4 px-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] first:mt-0"
      style={{ color: 'var(--text3)' }}>
      {children}
    </p>
  )
}

function navItemStyle(active: boolean) {
  return { background: active ? 'var(--bg3)' : 'transparent', color: active ? 'var(--text)' : 'var(--text3)' }
}

function hoverOn(e: React.MouseEvent, active: boolean) {
  if (active) return
  const el = e.currentTarget as HTMLElement
  el.style.background = 'var(--hover)'
  el.style.color = 'var(--text2)'
}
function hoverOff(e: React.MouseEvent, active: boolean) {
  if (active) return
  const el = e.currentTarget as HTMLElement
  el.style.background = 'transparent'
  el.style.color = 'var(--text3)'
}

/** Desktop sidebar — Spaces · Views · Settings */
export function SidebarNav({ collapsed = false }: { collapsed?: boolean }) {
  const isActive = useActiveItem()
  const { spaces, refresh } = useSpaces()
  const [dialogOpen, setDialogOpen] = useState(false)

  const renderItem = (item: NavItem) => {
    const active = isActive(item.href, item.exact)
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center rounded-xl py-2 text-[13px] font-medium transition-all ${collapsed ? 'justify-center px-0' : 'gap-2.5 px-2.5'}`}
        style={navItemStyle(active)}
        title={collapsed ? item.label : undefined}
        onMouseEnter={e => hoverOn(e, active)}
        onMouseLeave={e => hoverOff(e, active)}
      >
        <Icon name={item.icon} />
        {!collapsed && item.label}
      </Link>
    )
  }

  return (
    <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      {!collapsed && (
        <div className="mb-2 flex items-center justify-between px-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text3)' }}>
            Spaces
          </p>
          <button
            onClick={() => setDialogOpen(true)}
            className="text-[15px] leading-none transition-colors"
            style={{ color: 'var(--text3)' }}
            title="New space"
            aria-label="New space"
          >
            +
          </button>
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        {spaces.map(space => {
          const href = `/space/${space.id}`
          const active = isActive(href)
          return (
            <Link
              key={space.id}
              href={href}
              className={`flex items-center rounded-xl py-2 text-[13px] font-medium transition-all ${collapsed ? 'justify-center px-0' : 'gap-2.5 px-2.5'}`}
              style={navItemStyle(active)}
              title={collapsed ? space.name : undefined}
              onMouseEnter={e => hoverOn(e, active)}
              onMouseLeave={e => hoverOff(e, active)}
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: space.color }} />
              {!collapsed && <span className="truncate">{space.name}</span>}
            </Link>
          )
        })}
      </div>

      {!collapsed && <SectionLabel>Views</SectionLabel>}
      {collapsed && <div className="my-3 h-px" style={{ background: 'var(--divider)' }} />}
      <div className="flex flex-col gap-0.5">{VIEW_ITEMS.map(renderItem)}</div>

      {!collapsed && <SectionLabel>Settings</SectionLabel>}
      {collapsed && <div className="my-3 h-px" style={{ background: 'var(--divider)' }} />}
      <div className="flex flex-col gap-0.5">{SETTINGS_ITEMS.map(renderItem)}</div>

      <SpaceFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSaved={refresh} />
    </nav>
  )
}

/** Mobile bottom navigation — focused subset of views */
export function BottomNav() {
  const isActive = useActiveItem()
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2 lg:hidden"
      style={{ background: 'var(--bg)', borderTop: '1px solid var(--divider)' }}
    >
      {BOTTOM_ITEMS.map(item => {
        const active = isActive(item.href, item.exact)
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 px-3 py-1"
            style={{ color: active ? 'var(--accent)' : 'var(--text3)' }}
          >
            <Icon name={item.icon} />
            <span style={{ fontSize: 10, fontWeight: active ? 500 : 400 }}>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
