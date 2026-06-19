'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import type { Space } from '@flou/shared'
import { apiFetch } from '@/lib/auth'

const COLORS = ['#6366f1', '#0ea5e9', '#f59e0b', '#ec4899', '#10b981', '#ef4444', '#8b5cf6', '#14b8a6']

export function SpaceFormDialog({
  open,
  onClose,
  onSaved,
  space,
}: {
  open: boolean
  onClose: () => void
  onSaved: () => void
  space?: Space | null
}) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [saving, setSaving] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName(space?.name ?? '')
      setColor(space?.color ?? COLORS[0])
      setError(null)
    }
  }, [open, space])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError(null)
    try {
      const res = space
        ? await apiFetch(`/api/spaces/${space.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name.trim(), color }),
          })
        : await apiFetch('/api/spaces', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name.trim(), color }),
          })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.message ?? 'Could not save space')
        return
      }
      onSaved()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  async function toggleArchive() {
    if (!space) return
    setArchiving(true)
    try {
      const res = await apiFetch(`/api/spaces/${space.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: !space.archived }),
      })
      if (res.ok) { onSaved(); onClose() }
    } finally {
      setArchiving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0" style={{ background: 'rgba(15,12,10,0.5)', backdropFilter: 'blur(4px)' }} />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          className="w-full max-w-sm rounded-2xl p-5"
          style={{ background: 'var(--bg)', boxShadow: 'var(--shadow)' }}
        >
          <DialogTitle className="mb-4 text-[15px] font-medium" style={{ color: 'var(--text)' }}>
            {space ? 'Edit space' : 'New space'}
          </DialogTitle>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-[12px] font-medium" style={{ color: 'var(--text2)' }}>
                Name
              </label>
              <input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. DOCSET"
                className="w-full rounded-xl px-3 py-2 text-[13px] outline-none"
                style={{ background: 'var(--bg2)', color: 'var(--text)', border: '1px solid var(--divider)' }}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-medium" style={{ color: 'var(--text2)' }}>
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="h-7 w-7 rounded-full transition-transform"
                    style={{
                      background: c,
                      transform: color === c ? 'scale(1.15)' : 'none',
                      boxShadow: color === c ? '0 0 0 2px var(--bg), 0 0 0 4px ' + c : 'none',
                    }}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>

            {error && <p className="text-[12px]" style={{ color: 'var(--rose)' }}>{error}</p>}

            <div className="mt-1 flex items-center gap-2">
              {space && (
                <button
                  type="button"
                  onClick={toggleArchive}
                  disabled={archiving}
                  className="rounded-xl px-3 py-2 text-[13px] font-medium disabled:opacity-50"
                  style={{ color: 'var(--text2)', border: '1px solid var(--divider)' }}
                >
                  {archiving ? '…' : space.archived ? 'Unarchive' : 'Archive'}
                </button>
              )}
              <div className="flex-1" />
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-3 py-2 text-[13px] font-medium"
                style={{ color: 'var(--text2)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl px-4 py-2 text-[13px] font-medium text-white disabled:opacity-50"
                style={{ background: 'var(--accent)' }}
              >
                {saving ? 'Saving…' : space ? 'Save' : 'Create'}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
