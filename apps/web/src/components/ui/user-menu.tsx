'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import type { User } from '@flou/shared'

interface UserMenuProps {
  user: User
  compact?: boolean
}

export function UserMenu({ user, compact = false }: UserMenuProps) {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/login')
    router.refresh()
  }

  const initials = user.email.slice(0, 2).toUpperCase()

  return (
    <Menu as="div" className="relative">
      <MenuButton
        className={`flex items-center justify-center rounded-[10px] transition-colors focus:outline-none data-[open]:opacity-80 ${
          compact ? 'h-9 w-9' : 'w-full gap-2.5 rounded-xl px-2 py-2 data-[hover]:bg-[var(--bg3)]/40'
        }`}
      >
        <span
          className="flex shrink-0 items-center justify-center rounded-full font-medium text-white"
          style={{
            background: 'var(--sand-dark)',
            width: compact ? 32 : 28,
            height: compact ? 32 : 28,
            fontSize: compact ? 12 : 11,
          }}
        >
          {initials}
        </span>
        {!compact && (
          <>
            <span className="flex-1 truncate text-[12px]" style={{ color: 'var(--text3)' }}>
              {user.email}
            </span>
            <svg className="h-3 w-3 shrink-0" style={{ color: 'var(--text3)' }} viewBox="0 0 12 12" fill="currentColor">
              <path d="M2.22 4.47a.75.75 0 0 1 1.06 0L6 7.19l2.72-2.72a.75.75 0 1 1 1.06 1.06L6.53 8.78a.75.75 0 0 1-1.06 0L2.22 5.53a.75.75 0 0 1 0-1.06Z" />
            </svg>
          </>
        )}
      </MenuButton>

      <Transition
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <MenuItems
          anchor={compact ? 'right end' : 'top start'}
          className="z-20 mb-1 w-52 rounded-xl border bg-[var(--bg)] shadow-[var(--shadow)] focus:outline-none"
          style={{ borderColor: 'var(--divider)' }}
        >
          <div className="border-b px-3.5 py-3" style={{ borderColor: 'var(--divider)' }}>
            <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text3)' }}>
              Signed in as
            </p>
            <p className="mt-0.5 truncate text-[13px] font-medium" style={{ color: 'var(--text)' }}>
              {user.email}
            </p>
          </div>
          <div className="p-1">
            <MenuItem>
              <Link
                href="/profile"
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors data-[focus]:bg-[var(--bg2)]"
                style={{ color: 'var(--text2)' }}
              >
                <svg className="h-3.5 w-3.5" style={{ color: 'var(--text3)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                Profile &amp; Settings
              </Link>
            </MenuItem>
            <MenuItem>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors data-[focus]:bg-[var(--bg2)] data-[disabled]:opacity-40"
                style={{ color: 'var(--text2)' }}
              >
                {loggingOut ? (
                  <svg className="h-3.5 w-3.5 animate-spin" style={{ color: 'var(--text3)' }} viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="h-3.5 w-3.5" style={{ color: 'var(--text3)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                )}
                {loggingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </MenuItem>
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  )
}
