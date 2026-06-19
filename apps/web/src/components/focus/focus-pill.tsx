'use client'

import { useFocus, formatDuration } from '@/components/focus/focus-context'
import { useSpaces } from '@/components/spaces/space-context'

/** Floating timer shown while a focus session is running. */
export function FocusPill() {
  const { active, elapsedSec, stop } = useFocus()
  const { spaces } = useSpaces()
  if (!active) return null

  const space = active.spaceId ? spaces.find(s => s.id === active.spaceId) : undefined

  return (
    <div
      className="fixed bottom-24 right-5 z-40 flex items-center gap-3 rounded-full py-2 pl-3 pr-2 lg:bottom-5 lg:right-20"
      style={{ background: 'var(--bg2)', boxShadow: 'var(--shadow)', border: '1px solid var(--divider)' }}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: space?.color ?? 'var(--accent)' }} />
        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: space?.color ?? 'var(--accent)' }} />
      </span>
      <span className="tabular-nums text-[14px] font-medium" style={{ color: 'var(--text)' }}>
        {formatDuration(elapsedSec)}
      </span>
      {space && <span className="text-[12px]" style={{ color: 'var(--text3)' }}>{space.name}</span>}
      <button
        onClick={stop}
        className="flex h-7 w-7 items-center justify-center rounded-full"
        style={{ background: 'var(--bg3)', color: 'var(--text)' }}
        aria-label="Stop focus"
        title="Stop focus"
      >
        <svg width="11" height="11" viewBox="0 0 14 14" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="1.5" /></svg>
      </button>
    </div>
  )
}
