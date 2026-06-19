'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { TimeSession } from '@flou/shared'
import { apiFetch } from '@/lib/auth'

interface StartArgs { spaceId?: string | null; taskId?: string | null; note?: string | null }

interface FocusContextValue {
  active: TimeSession | null
  /** Seconds elapsed on the active session (live, ticks every second). */
  elapsedSec: number
  start: (args?: StartArgs) => Promise<void>
  stop: () => Promise<void>
}

const FocusContext = createContext<FocusContextValue | null>(null)

export function FocusProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<TimeSession | null>(null)
  const [elapsedSec, setElapsedSec] = useState(0)
  const tick = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load any in-progress session on mount.
  useEffect(() => {
    apiFetch('/api/time-sessions/active').then(r => (r.ok ? r.json() : null)).then((s: TimeSession | null) => setActive(s))
  }, [])

  // Live ticking while a session is active.
  useEffect(() => {
    if (tick.current) { clearInterval(tick.current); tick.current = null }
    if (!active) { setElapsedSec(0); return }
    const startedMs = new Date(active.startedAt).getTime()
    const update = () => setElapsedSec(Math.max(0, Math.round((Date.now() - startedMs) / 1000)))
    update()
    tick.current = setInterval(update, 1000)
    return () => { if (tick.current) clearInterval(tick.current) }
  }, [active])

  const start = useCallback(async (args?: StartArgs) => {
    const res = await apiFetch('/api/time-sessions/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args ?? {}),
    })
    if (res.ok) setActive(await res.json())
  }, [])

  const stop = useCallback(async () => {
    const res = await apiFetch('/api/time-sessions/stop', { method: 'POST' })
    if (res.ok) setActive(null)
  }, [])

  return (
    <FocusContext.Provider value={{ active, elapsedSec, start, stop }}>
      {children}
    </FocusContext.Provider>
  )
}

export function useFocus(): FocusContextValue {
  const ctx = useContext(FocusContext)
  if (!ctx) throw new Error('useFocus must be used within a FocusProvider')
  return ctx
}

export function formatDuration(totalSec: number): string {
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}
