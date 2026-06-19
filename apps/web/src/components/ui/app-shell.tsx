'use client'

import { useState } from 'react'
import type { User, Space } from '@flou/shared'
import { SidebarNav, BottomNav } from '@/components/ui/app-nav'
import { UserMenu } from '@/components/ui/user-menu'
import { CaptureButton } from '@/components/capture/capture-button'
import { CommandPalette } from '@/components/ui/command-palette'
import { SpaceProvider } from '@/components/spaces/space-context'
import { FocusProvider } from '@/components/focus/focus-context'
import { FocusPill } from '@/components/focus/focus-pill'

export function AppShell({ user, spaces, children }: { user: User; spaces: Space[]; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <SpaceProvider initialSpaces={spaces}>
    <FocusProvider>
      <div className="flex h-screen bg-[var(--bg)] p-3">
        <aside
          className="hidden shrink-0 flex-col rounded-2xl transition-all duration-200 lg:flex"
          style={{
            width: collapsed ? 72 : 180,
            background: 'var(--bg2)',
            padding: collapsed ? '18px 10px' : '20px 12px',
            marginRight: 12,
          }}
        >
          <div className={`mb-7 flex items-center ${collapsed ? 'justify-center' : 'gap-2 px-1.5'}`}>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px]"
              style={{ background: 'var(--accent)' }}>
              <span className="font-serif italic text-[12px] font-medium text-white"
                style={{ letterSpacing: '-0.5px' }}>fl</span>
            </div>
            {!collapsed && (
              <span className="font-serif text-[14px] font-medium"
                style={{ color: 'var(--text)', letterSpacing: '-0.3px' }}>flou</span>
            )}
          </div>

          <SidebarNav collapsed={collapsed} />

          <div className="mt-3" />

          <button
            onClick={() => setCollapsed(value => !value)}
            className="mb-3 flex h-9 items-center justify-center rounded-xl transition-colors"
            style={{ color: 'var(--text3)', background: 'rgba(255,255,255,0.28)' }}
            title={collapsed ? 'Expand menu' : 'Collapse menu'}
            aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            >
              <path d="M12 4l-6 6 6 6" />
              <path d="M18 4l-6 6 6 6" opacity="0.45" />
            </svg>
          </button>

          {!collapsed ? (
            <UserMenu user={user} />
          ) : (
            <div className="flex justify-center">
              <UserMenu user={user} compact />
            </div>
          )}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
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

          <div className="flex min-h-0 flex-1 gap-3 overflow-hidden pb-16 lg:pb-0">
            {children}
          </div>
        </div>
      </div>

      <BottomNav />
      <CaptureButton />
      <CommandPalette />
      <FocusPill />
    </FocusProvider>
    </SpaceProvider>
  )
}
