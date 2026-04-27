'use client'

import { useState } from 'react'
import { CaptureDialog } from './capture-dialog'

export function CaptureButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="AI Capture"
        title="AI Capture — classify & save anything"
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          zIndex: 40,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'var(--accent)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(108,99,255,0.45), 0 2px 8px rgba(0,0,0,0.15)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.08)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        {/* Sparkle / capture icon */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2l2.09 6.26L20 9.27l-4.91 3.56 1.82 6.17L12 15.6l-4.91 3.4 1.82-6.17L4 9.27l5.91-1.01z"
            fill="white"
          />
          <circle cx="19" cy="4" r="1.5" fill="rgba(255,255,255,0.6)" />
          <circle cx="5" cy="18" r="1" fill="rgba(255,255,255,0.4)" />
        </svg>
      </button>

      <CaptureDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
}
