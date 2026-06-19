'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import type { Task } from '@flou/shared'

interface TaskDialogProps {
  open: boolean
  initialDate: string // YYYY-MM-DD
  onClose: () => void
  onCreated: (task: Task) => void
}

export function TaskDialog({ open, initialDate, onClose, onCreated }: TaskDialogProps) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(initialDate)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setDate(initialDate) }, [initialDate])

  useEffect(() => {
    if (open) { setTitle(''); setError('') }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), date }),
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

  const dateLabel = (() => {
    try {
      const [y, m, d] = date.split('-').map(Number)
      return new Date(y!, m! - 1, d!).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
      })
    } catch { return date }
  })()

  const field: React.CSSProperties = {
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
          <div className="fixed inset-0" style={{ background: 'rgba(15,12,10,0.5)', backdropFilter: 'blur(2px)' }} aria-hidden="true" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            enter="ease-out duration-200" enterFrom="opacity-0 scale-[0.97] translate-y-1" enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-[0.97]"
          >
            <DialogPanel
              className="w-full max-w-[400px] overflow-hidden rounded-2xl"
              style={{ background: 'var(--bg)', boxShadow: 'var(--shadow)', border: '1px solid var(--divider)' }}
            >
              {/* Header */}
              <div style={{ background: 'var(--bg2)', padding: '20px 24px', borderBottom: '1px solid var(--divider)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <DialogTitle style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text3)' }}>
                      New task
                    </DialogTitle>
                    <p style={{ marginTop: 2, fontSize: 13, fontWeight: 500, color: 'var(--text2)' }}>{dateLabel}</p>
                  </div>
                  <button type="button" onClick={onClose} aria-label="Close"
                    style={{ marginTop: 2, padding: 6, borderRadius: 8, color: 'var(--text3)', cursor: 'pointer', background: 'transparent', border: 'none' }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 16 16" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2 2l12 12M14 2L2 14" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: 24 }}>
                <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {error && (
                    <p role="alert" style={{ fontSize: 12, padding: '8px 12px', borderRadius: 8, color: '#dc2626', background: 'rgba(220,38,38,0.1)' }}>
                      {error}
                    </p>
                  )}

                  <input
                    ref={inputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    maxLength={200}
                    style={{ ...field, fontSize: 16, fontWeight: 500 }}
                  />

                  <div>
                    <label htmlFor="task-date" style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text3)', marginBottom: 6 }}>
                      Date
                    </label>
                    <input id="task-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} style={field} />
                  </div>

                  <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
                    <button type="button" onClick={onClose}
                      style={{ flex: 1, padding: '10px', borderRadius: 12, fontSize: 13, fontWeight: 500, border: '1px solid var(--divider)', color: 'var(--text2)', background: 'transparent', cursor: 'pointer' }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={loading || !title.trim()}
                      style={{ flex: 1, padding: '10px', borderRadius: 12, fontSize: 13, fontWeight: 500, color: '#fff', background: 'var(--accent)', cursor: 'pointer', opacity: loading || !title.trim() ? 0.4 : 1 }}>
                      {loading ? 'Adding…' : 'Add task'}
                    </button>
                  </div>
                </form>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}
