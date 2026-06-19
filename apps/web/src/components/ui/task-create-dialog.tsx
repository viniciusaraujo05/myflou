'use client'

import { useEffect, useRef, useState } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import type { Task, Status, Milestone } from '@flou/shared'
import { apiFetch } from '@/lib/auth'
import { useSpaces } from '@/components/spaces/space-context'

interface TaskCreateDialogProps {
  open: boolean
  /** Preselect this space (e.g. when opened from a Space's Tasks tab). */
  defaultSpaceId?: string | null
  defaultDate?: string // YYYY-MM-DD
  statuses: Status[]
  onClose: () => void
  onCreated: (task: Task) => void
}

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function TaskCreateDialog({ open, defaultSpaceId, defaultDate, statuses, onClose, onCreated }: TaskCreateDialogProps) {
  const { spaces } = useSpaces()
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(defaultDate ?? todayStr())
  const [spaceId, setSpaceId] = useState<string | null>(defaultSpaceId ?? null)
  const [statusId, setStatusId] = useState<string | null>(null)
  const [milestoneId, setMilestoneId] = useState<string | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTitle('')
      setDate(defaultDate ?? todayStr())
      setSpaceId(defaultSpaceId ?? null)
      setStatusId(null)
      setMilestoneId(null)
      setError('')
      apiFetch('/api/milestones').then(r => (r.ok ? r.json() : [])).then(setMilestones)
    }
  }, [open, defaultSpaceId, defaultDate])

  // Milestones relevant to the chosen space (plus space-less ones).
  const milestoneOptions = milestones.filter(m => !m.spaceId || m.spaceId === spaceId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    setLoading(true)
    setError('')
    try {
      const res = await apiFetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), date, spaceId, statusId, milestoneId }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Failed to create task'); return }
      onCreated(data as Task)
      onClose()
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 10, fontWeight: 500, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6,
  }
  const fieldStyle: React.CSSProperties = {
    width: '100%', fontSize: 14, padding: '9px 12px', borderRadius: 10,
    border: '1.5px solid var(--divider)', background: 'var(--bg2)',
    color: 'var(--text)', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <Transition show={open}>
      <Dialog onClose={onClose} className="relative z-50" initialFocus={inputRef}>
        <TransitionChild
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0" style={{ background: 'rgba(28,24,20,0.3)', backdropFilter: 'blur(2px)' }} aria-hidden="true" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            enter="ease-out duration-200" enterFrom="opacity-0 scale-[0.97] translate-y-1"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-[0.97]"
          >
            <DialogPanel
              className="w-full max-w-[460px] overflow-hidden rounded-2xl"
              style={{ background: 'var(--bg)', boxShadow: 'var(--shadow)', border: '1px solid var(--divider)' }}
            >
              <div style={{ background: 'var(--bg2)', padding: '20px 24px', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <DialogTitle style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', color: 'var(--text3)', textTransform: 'uppercase' }}>
                  New task
                </DialogTitle>
                <button type="button" onClick={onClose} style={{ padding: 6, borderRadius: 8, color: 'var(--text3)', cursor: 'pointer' }} aria-label="Close">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                    <path d="M2 2l12 12M14 2L2 14" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {error && (
                    <p style={{ fontSize: 12, color: '#dc2626', padding: '8px 12px', borderRadius: 8, background: '#fef2f2' }}>{error}</p>
                  )}

                  <div>
                    <label style={labelStyle}>Title</label>
                    <input
                      ref={inputRef}
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="What needs to be done?"
                      maxLength={200}
                      style={fieldStyle}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Date</label>
                      <input type="date" value={date} onChange={e => setDate(e.target.value)} style={fieldStyle} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Space</label>
                      <select
                        value={spaceId ?? ''}
                        onChange={e => setSpaceId(e.target.value || null)}
                        style={{ ...fieldStyle, appearance: 'auto' as React.CSSProperties['appearance'] }}
                      >
                        <option value="">No space (Inbox)</option>
                        {spaces.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {statuses.length > 0 && (
                    <div>
                      <label style={labelStyle}>Status</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => setStatusId(null)}
                          style={{
                            padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                            border: `1.5px solid ${statusId === null ? 'var(--text)' : 'var(--divider)'}`,
                            background: statusId === null ? 'var(--bg3)' : 'transparent',
                            color: statusId === null ? 'var(--text)' : 'var(--text3)', cursor: 'pointer',
                          }}
                        >
                          None
                        </button>
                        {statuses.map(s => {
                          const active = statusId === s.id
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setStatusId(active ? null : s.id)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                                border: `1.5px solid ${active ? s.color : 'var(--divider)'}`,
                                background: active ? s.color + '22' : 'transparent',
                                color: active ? s.color : 'var(--text2)', cursor: 'pointer',
                              }}
                            >
                              <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, flexShrink: 0, display: 'inline-block' }} />
                              {s.name}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {milestoneOptions.length > 0 && (
                    <div>
                      <label style={labelStyle}>Milestone</label>
                      <select
                        value={milestoneId ?? ''}
                        onChange={e => setMilestoneId(e.target.value || null)}
                        style={{ ...fieldStyle, appearance: 'auto' as React.CSSProperties['appearance'] }}
                      >
                        <option value="">None</option>
                        {milestoneOptions.map(m => (
                          <option key={m.id} value={m.id}>{m.title}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div style={{ padding: '14px 24px', borderTop: '1px solid var(--divider)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button
                    type="button" onClick={onClose}
                    style={{ padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 500, border: '1px solid var(--divider)', color: 'var(--text2)', background: 'transparent', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" disabled={loading || !title.trim()}
                    style={{ padding: '8px 18px', borderRadius: 10, fontSize: 12, fontWeight: 500, background: 'var(--accent)', color: '#fff', cursor: 'pointer', opacity: loading || !title.trim() ? 0.5 : 1 }}
                  >
                    {loading ? 'Adding…' : 'Add task'}
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}
