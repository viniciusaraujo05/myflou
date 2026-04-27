'use client'

import { useState, useEffect } from 'react'

export function DateLine({ className }: { className?: string }) {
  const [label, setLabel] = useState('')

  useEffect(() => {
    setLabel(
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
    )
  }, [])

  if (!label) return null
  return <span className={className}>{label}</span>
}
