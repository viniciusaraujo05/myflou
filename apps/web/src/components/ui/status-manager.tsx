'use client'

import { useState } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import type { Status } from '@flou/shared'
import { apiFetch } from '@/lib/auth'

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#06b6d4', '#a3a3a3', '#78716c',
]

interface StatusManagerProps {
  open: boolean
  statuses: Status[]
  onClose: () => void
  onStatusesChange: (statuses: Status[]) => void
}

interface EditingStatus {
  id?: string  // undefined = new
  name: string
  color: string
}

export function StatusManager({ open, statuses, onClose, onStatusesChange }: StatusManagerProps) {
  const [editing, setEditing] = useState<EditingStatus | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  function startNew() {
    setEditing({ name: '', color: PRESET_COLORS[0]! })
    setError('')
  }

  function startEdit(s: Status) {
    setEditing({ id: s.id, name: s.name, color: s.color })
    setError('')
  }

  function cancelEdit() {
    setEditing(null)
    setError('')
  }

  async function handleSave() {
    if (!editing) return
    const name = editing.name.trim()
    if (!name) { setError('Name is required'); return }
    setSaving(true)
    setError('')
    try {
      if (editing.id) {
        const res = await apiFetch(`/api/statuses/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, color: editing.color }),
        })
        if (!res.ok) { setError('Failed to update status'); return }
        const updated: Status = await res.json()
        onStatusesChange(statuses.map(s => s.id === updated.id ? updated : s))
      } else {
        const res = await apiFetch('/api/statuses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, color: editing.color }),
        })
        if (!res.ok) { setError('Failed to create status'); return }
        const created: Status = await res.json()
        onStatusesChange([...statuses, created])
      }
      setEditing(null)
    } catch {
      setError('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const res = await apiFetch(`/api/statuses/${id}`, { method: 'DELETE' })
      if (res.ok) {
        onStatusesChange(statuses.filter(s => s.id !== id))
        if (editing?.id === id) setEditing(null)
      }
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Transition show={open}>
      <Dialog onClose={onClose} className="relative z-50">

        <TransitionChild
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0" style={{ background: 'rgba(28,24,20,0.3)', backdropFilter: 'blur(2px)' }} aria-hidden="true" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            enter="ease-out duration-200" enterFrom="opacity-0 scale-[0.97]" enterTo="opacity-100 scale-100"
            leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-[0.97]"
          >
            <DialogPanel
              className="w-full max-w-[440px] overflow-hidden rounded-2xl"
              style={{ background: 'var(--bg)', boxShadow: 'var(--shadow)', border: '1px solid var(--divider)' }}
            >
              {/* Header */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <DialogTitle style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                  Manage statuses
                </DialogTitle>
                <button onClick={onClose} style={{ padding: 6, borderRadius: 8, color: 'var(--text3)', cursor: 'pointer' }} aria-label="Close">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                    <path d="M2 2l12 12M14 2L2 14" />
                  </svg>
                </button>
              </div>

              <div style={{ padding: '16px 24px', maxHeight: 420, overflowY: 'auto' }}>

                {/* Status list */}
                {statuses.length === 0 && !editing && (
                  <p style={{ fontSize: 13, color: 'var(--text3)', fontStyle: 'italic', textAlign: 'center', padding: '12px 0' }}>
                    No statuses yet.
                  </p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {statuses.map(s => (
                    <div
                      key={s.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 10px', borderRadius: 10,
                        background: editing?.id === s.id ? 'var(--bg2)' : 'transparent',
                      }}
                    >
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>{s.name}</span>
                      <button
                        onClick={() => startEdit(s)}
                        style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, border: '1px solid var(--divider)', color: 'var(--text2)', cursor: 'pointer', background: 'transparent' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        disabled={deletingId === s.id}
                        style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, border: '1px solid var(--divider)', color: '#dc2626', cursor: 'pointer', background: 'transparent', opacity: deletingId === s.id ? 0.5 : 1 }}
                      >
                        {deletingId === s.id ? '…' : 'Delete'}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Edit / Create form */}
                {editing && (
                  <div style={{
                    marginTop: 16, padding: '16px', borderRadius: 12,
                    border: '1.5px solid var(--divider)', background: 'var(--bg2)',
                    display: 'flex', flexDirection: 'column', gap: 14,
                  }}>
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)' }}>
                      {editing.id ? 'Edit status' : 'New status'}
                    </p>

                    {error && (
                      <p style={{ fontSize: 12, color: '#dc2626' }}>{error}</p>
                    )}

                    {/* Name */}
                    <input
                      type="text"
                      value={editing.name}
                      onChange={e => setEditing(prev => prev ? { ...prev, name: e.target.value } : prev)}
                      placeholder="Status name…"
                      maxLength={50}
                      autoFocus
                      style={{
                        fontSize: 13, padding: '8px 12px', borderRadius: 8,
                        border: '1.5px solid var(--divider)', background: 'var(--bg)',
                        color: 'var(--text)', outline: 'none',
                      }}
                      onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--divider)')}
                    />

                    {/* Color picker */}
                    <div>
                      <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>Color</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {PRESET_COLORS.map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setEditing(prev => prev ? { ...prev, color: c } : prev)}
                            style={{
                              width: 28, height: 28, borderRadius: '50%', background: c,
                              border: editing.color === c ? '3px solid var(--text)' : '2px solid transparent',
                              outline: editing.color === c ? '1px solid var(--bg)' : 'none',
                              cursor: 'pointer',
                              boxSizing: 'border-box',
                            }}
                            aria-label={c}
                          />
                        ))}
                      </div>
                      {/* Custom hex input */}
                      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 22, height: 22, borderRadius: 4, background: editing.color, flexShrink: 0 }} />
                        <input
                          type="text"
                          value={editing.color}
                          onChange={e => {
                            const v = e.target.value
                            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setEditing(prev => prev ? { ...prev, color: v } : prev)
                          }}
                          maxLength={7}
                          style={{
                            width: 90, fontSize: 12, padding: '4px 8px', borderRadius: 6,
                            border: '1px solid var(--divider)', background: 'var(--bg)',
                            color: 'var(--text)', outline: 'none', fontFamily: 'monospace',
                          }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button" onClick={cancelEdit}
                        style={{ flex: 1, padding: '7px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: '1px solid var(--divider)', color: 'var(--text2)', background: 'transparent', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button" onClick={handleSave} disabled={saving}
                        style={{ flex: 1, padding: '7px', borderRadius: 8, fontSize: 12, fontWeight: 500, background: 'var(--accent)', color: '#fff', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}
                      >
                        {saving ? 'Saving…' : editing.id ? 'Update' : 'Create'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              {!editing && (
                <div style={{ padding: '14px 24px', borderTop: '1px solid var(--divider)' }}>
                  <button
                    onClick={startNew}
                    style={{
                      width: '100%', padding: '9px', borderRadius: 10, fontSize: 13, fontWeight: 500,
                      border: '1.5px dashed var(--divider)', color: 'var(--text2)',
                      background: 'transparent', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M10 4v12M4 10h12" />
                    </svg>
                    New status
                  </button>
                </div>
              )}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}
