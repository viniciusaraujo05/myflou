'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import type { Space } from '@flou/shared'
import { apiFetch } from '@/lib/auth'

interface SpaceContextValue {
  spaces: Space[]
  /** Re-fetch the space list from the API (after create/rename/delete). */
  refresh: () => Promise<void>
}

const SpaceContext = createContext<SpaceContextValue | null>(null)

export function SpaceProvider({ initialSpaces, children }: { initialSpaces: Space[]; children: React.ReactNode }) {
  const [spaces, setSpaces] = useState<Space[]>(initialSpaces)

  const refresh = useCallback(async () => {
    const res = await apiFetch('/api/spaces')
    if (res.ok) setSpaces(await res.json())
  }, [])

  return <SpaceContext.Provider value={{ spaces, refresh }}>{children}</SpaceContext.Provider>
}

export function useSpaces(): SpaceContextValue {
  const ctx = useContext(SpaceContext)
  if (!ctx) throw new Error('useSpaces must be used within a SpaceProvider')
  return ctx
}
