'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import type { Task, Status } from '@flou/shared'
import { apiFetch } from '@/lib/auth'
import { StatusManager } from '@/components/ui/status-manager'

interface TaskDetailDialogProps {
  task: Task | null
  statuses: Status[]
  onClose: () => void
  onUpdated: (task: Task) => void
  onDeleted: (task: Task) => void
  onStatusesChange: (statuses: Status[]) => void
}

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y!, m! - 1, d!)
}

export function TaskDetailDialog({ task, statuses, onClose, onUpdated, onDeleted, onStatusesChange }: TaskDetailDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [hoursSpent, setHoursSpent] = useState('')
  const [statusId, setStatusId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [statusManagerOpen, setStatusManagerOpen] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description ?? '')
      setHoursSpent(task.hoursSpent != null ? String(task.hoursSpent) : '')
      setStatusId(task.statusId)
      setError('')
    }
  }, [task])

  const open = task !== null

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!task) return
    const trimmed = title.trim()
    if (!trimmed) { setError('Title is required'); return }
    const hours = hoursSpent !== '' ? parseFloat(hoursSpent) : null
    if (hours !== null && (isNaN(hours) || hours < 0 || hours > 24)) {
      setError('Hours must be between 0 and 24')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await apiFetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: trimmed,
          description: description.trim() || null,
          hoursSpent: hours,
          statusId,
        }),
      })
      if (!res.ok) { setError('Failed to save'); return }
      onUpdated(await res.json())
      onClose()
    } catch {
      setError('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!task) return
    setDeleting(true)
    try {
      const res = await apiFetch(`/api/tasks/${task.id}`, { method: 'DELETE' })
      if (res.ok) { onDeleted(task); onClose() }
    } finally {
      setDeleting(false)
    }
  }

  const dateLabel = task
    ? parseLocalDate(task.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : ''

  return (
    <>
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
              enter="ease-out duration-200" enterFrom="opacity-0 scale-[0.97] translate-y-1"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-[0.97]"
            >
              <DialogPanel
                className="w-full max-w-[460px] overflow-hidden rounded-2xl"
                style={{ background: 'var(--bg)', boxShadow: 'var(--shadow)', border: '1px solid var(--divider)' }}
              >
                {/* Header */}
                <div style={{ background: 'var(--bg2)', padding: '20px 24px', borderBottom: '1px solid var(--divider)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <DialogTitle style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', color: 'var(--text3)', textTransform: 'uppercase' }}>
                        Task details
                      </DialogTitle>
                      <p style={{ marginTop: 2, fontSize: 12, color: 'var(--text3)' }}>{dateLabel}</p>
                    </div>
                    <button
                      type="button" onClick={onClose}
                      style={{ padding: 6, borderRadius: 8, color: 'var(--text3)', cursor: 'pointer' }}
                      aria-label="Close"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                        <path d="M2 2l12 12M14 2L2 14" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSave}>
                  <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {error && (
                      <p style={{ fontSize: 12, color: '#dc2626', padding: '8px 12px', borderRadius: 8, background: '#fef2f2' }}>
                        {error}
                      </p>
                    )}

                    {/* Title */}
                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>
                        Title
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        maxLength={200}
                        style={{
                          width: '100%', fontSize: 14, fontWeight: 500,
                          padding: '9px 12px', borderRadius: 10,
                          border: '1.5px solid var(--divider)',
                          background: 'var(--bg2)', color: 'var(--text)', outline: 'none',
                          boxSizing: 'border-box',
                        }}
                        onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--divider)')}
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <label style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)' }}>
                          Status
                        </label>
                        <button
                          type="button"
                          onClick={() => setStatusManagerOpen(true)}
                          style={{
                            fontSize: 10, padding: '2px 8px', borderRadius: 6, cursor: 'pointer',
                            border: '1px solid var(--divider)', color: 'var(--text3)',
                            background: 'transparent',
                            display: 'flex', alignItems: 'center', gap: 4,
                          }}
                        >
                          <svg width="9" height="9" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M10 4v12M4 10h12" />
                          </svg>
                          Manage
                        </button>
                      </div>

                      {statuses.length === 0 ? (
                        <button
                          type="button"
                          onClick={() => setStatusManagerOpen(true)}
                          style={{
                            width: '100%', padding: '8px', borderRadius: 8, fontSize: 12,
                            border: '1.5px dashed var(--divider)', color: 'var(--text3)',
                            background: 'transparent', cursor: 'pointer',
                          }}
                        >
                          Create your first status →
                        </button>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => setStatusId(null)}
                            style={{
                              padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                              border: `1.5px solid ${statusId === null ? 'var(--text)' : 'var(--divider)'}`,
                              background: statusId === null ? 'var(--bg3)' : 'transparent',
                              color: statusId === null ? 'var(--text)' : 'var(--text3)',
                              cursor: 'pointer',
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
                                  color: active ? s.color : 'var(--text2)',
                                  cursor: 'pointer',
                                }}
                              >
                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, flexShrink: 0, display: 'inline-block' }} />
                                {s.name}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>
                        Description
                      </label>
                      <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        maxLength={2000}
                        rows={3}
                        placeholder="Notes, context, links…"
                        style={{
                          width: '100%', fontSize: 13, lineHeight: 1.6,
                          padding: '9px 12px', borderRadius: 10, resize: 'vertical',
                          border: '1.5px solid var(--divider)',
                          background: 'var(--bg2)', color: 'var(--text)', outline: 'none',
                          boxSizing: 'border-box',
                        }}
                        onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--divider)')}
                      />
                    </div>

                    {/* Hours spent */}
                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>
                        Hours spent
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                          type="number"
                          value={hoursSpent}
                          onChange={e => setHoursSpent(e.target.value)}
                          min={0} max={24} step={0.5} placeholder="0"
                          style={{
                            width: 90, fontSize: 14, fontWeight: 500,
                            padding: '9px 12px', borderRadius: 10,
                            border: '1.5px solid var(--divider)',
                            background: 'var(--bg2)', color: 'var(--text)', outline: 'none',
                          }}
                          onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                          onBlur={e => (e.target.style.borderColor = 'var(--divider)')}
                        />
                        <span style={{ fontSize: 12, color: 'var(--text3)' }}>hrs</span>
                        {[0.5, 1, 2, 3, 4].map(h => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => setHoursSpent(String(hoursSpent === String(h) ? '' : h))}
                            style={{
                              padding: '4px 9px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                              border: '1px solid var(--divider)',
                              background: hoursSpent === String(h) ? 'var(--accent)' : 'var(--bg2)',
                              color: hoursSpent === String(h) ? '#fff' : 'var(--text2)',
                              cursor: 'pointer',
                            }}
                          >
                            {h}h
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{
                    padding: '14px 24px', borderTop: '1px solid var(--divider)',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <button
                      type="button" onClick={handleDelete} disabled={deleting}
                      style={{
                        padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 500,
                        border: '1px solid var(--divider)', color: '#dc2626',
                        background: 'transparent', cursor: 'pointer', opacity: deleting ? 0.5 : 1,
                      }}
                    >
                      {deleting ? '…' : 'Delete'}
                    </button>
                    <div style={{ flex: 1 }} />
                    <button
                      type="button" onClick={onClose}
                      style={{
                        padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 500,
                        border: '1px solid var(--divider)', color: 'var(--text2)',
                        background: 'transparent', cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit" disabled={saving}
                      style={{
                        padding: '8px 18px', borderRadius: 10, fontSize: 12, fontWeight: 500,
                        background: 'var(--accent)', color: '#fff', cursor: 'pointer',
                        opacity: saving ? 0.6 : 1,
                      }}
                    >
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>

      {/* Status manager — opens on top of task detail */}
      <StatusManager
        open={statusManagerOpen}
        statuses={statuses}
        onClose={() => setStatusManagerOpen(false)}
        onStatusesChange={updated => {
          onStatusesChange(updated)
          // if current status was deleted, clear it
          if (statusId && !updated.find(s => s.id === statusId)) {
            setStatusId(null)
          }
        }}
      />
    </>
  )
}
