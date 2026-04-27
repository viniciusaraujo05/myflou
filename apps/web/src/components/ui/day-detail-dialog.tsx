'use client'

import { useState } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import type { Task } from '@flou/shared'
import { apiFetch } from '@/lib/auth'

interface DayDetailDialogProps {
  open: boolean
  date: string // YYYY-MM-DD
  tasks: Task[]
  onClose: () => void
  onToggle: (task: Task) => void
  onDelete: (task: Task) => void
  onTaskCreated: (task: Task) => void
  onOpenTask?: (task: Task) => void
}

function CheckCircle({ completed, onToggle }: { completed: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex shrink-0 items-center justify-center rounded-full transition-all"
      style={{
        width: 18, height: 18,
        border: `1.5px solid ${completed ? 'var(--accent)' : 'var(--bg3)'}`,
        background: completed ? 'var(--accent)' : 'white',
      }}
      aria-label={completed ? 'Mark incomplete' : 'Mark complete'}
    >
      {completed && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M1.5 5.5l2.5 2.5 4.5-5" />
        </svg>
      )}
    </button>
  )
}

export function DayDetailDialog({
  open, date, tasks, onClose, onToggle, onTaskCreated, onOpenTask,
}: DayDetailDialogProps) {
  const [addTitle, setAddTitle] = useState('')
  const [addError, setAddError] = useState('')
  const [addLoading, setAddLoading] = useState(false)

  // Determine if past / today / future
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const [y, m, d] = date.split('-').map(Number)
  const selected = new Date(y!, m! - 1, d!)
  const isPast = selected < now
  const isToday = selected.getTime() === now.getTime()

  const dateLabel = selected.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  const contextLabel = isPast ? 'What you did' : isToday ? 'Today' : "What's planned"
  const headerBg = isPast ? 'var(--bg2)' : isToday ? 'var(--accent-bg)' : 'var(--sand)'
  const completedCount = tasks.filter(t => t.completed).length
  const totalHours = tasks.reduce((sum, t) => sum + (t.hoursSpent ?? 0), 0)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = addTitle.trim()
    if (!trimmed) return
    setAddLoading(true)
    setAddError('')
    try {
      const res = await apiFetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmed, date }),
      })
      const data = await res.json()
      if (!res.ok) { setAddError(data.message || 'Failed to add task'); return }
      onTaskCreated(data as Task)
      setAddTitle('')
    } catch {
      setAddError('Something went wrong')
    } finally {
      setAddLoading(false)
    }
  }

  return (
    <Transition show={open}>
      <Dialog onClose={onClose} className="relative z-50">

        {/* Backdrop */}
        <TransitionChild
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0" style={{ background: 'rgba(28,24,20,0.25)', backdropFilter: 'blur(2px)' }} aria-hidden="true" />
        </TransitionChild>

        {/* Panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            enter="ease-out duration-200" enterFrom="opacity-0 scale-[0.97] translate-y-1"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-[0.97]"
          >
            <DialogPanel className="w-full max-w-[420px] overflow-hidden rounded-2xl"
              style={{ background: 'var(--bg)', boxShadow: 'var(--shadow)', border: '1px solid var(--divider)' }}>

              {/* Header */}
              <div style={{ background: headerBg, padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <DialogTitle style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', color: 'var(--text3)', textTransform: 'uppercase' }}>
                      {contextLabel}
                    </DialogTitle>
                    <p style={{ marginTop: 2, fontSize: 13, fontWeight: 500, color: 'var(--text2)' }}>{dateLabel}</p>
                  </div>
                  <button
                    type="button" onClick={onClose}
                    style={{ marginTop: 2, padding: 6, borderRadius: 8, color: 'var(--text3)', cursor: 'pointer' }}
                    aria-label="Close"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                      <path d="M2 2l12 12M14 2L2 14" />
                    </svg>
                  </button>
                </div>
                {tasks.length > 0 && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <p style={{ fontSize: 11, color: 'var(--text3)' }}>
                      {completedCount}/{tasks.length} completed
                    </p>
                    {totalHours > 0 && (
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 5,
                        background: 'var(--accent-bg)', color: 'var(--accent)',
                      }}>
                        {totalHours % 1 === 0 ? totalHours : totalHours.toFixed(1)}h
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Task list */}
              <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                {tasks.length === 0 ? (
                  <p style={{ padding: '24px', textAlign: 'center', fontSize: 13, color: 'var(--text3)' }}>
                    {isPast ? 'Nothing was scheduled.' : 'No tasks yet.'}
                  </p>
                ) : (
                  <ul style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {tasks.map(task => (
                      <li key={task.id}
                        className="group/item"
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'default' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg2)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <CheckCircle completed={task.completed} onToggle={() => onToggle(task)} />
                        <button
                          onClick={() => onOpenTask?.(task)}
                          style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: onOpenTask ? 'pointer' : 'default' }}
                        >
                          <span style={{
                            fontSize: 13, lineHeight: 1.4, display: 'block',
                            textDecoration: task.completed ? 'line-through' : 'none',
                            color: task.completed ? 'var(--text3)' : isPast && !task.completed ? '#b45309' : 'var(--text)',
                          }}>
                            {task.title}
                          </span>
                          {task.hoursSpent != null && (
                            <span style={{ fontSize: 10, color: 'var(--text3)' }}>
                              {task.hoursSpent % 1 === 0 ? task.hoursSpent : task.hoursSpent.toFixed(1)}h
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => onOpenTask?.(task)}
                          style={{ padding: 6, borderRadius: 6, color: 'var(--text3)', cursor: 'pointer', flexShrink: 0 }}
                          aria-label="Edit task"
                        >
                          <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Add task — always available */}
              <div style={{ borderTop: '1px solid var(--divider)', padding: '14px 16px' }}>
                <form onSubmit={handleAdd}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="text" value={addTitle}
                      onChange={e => setAddTitle(e.target.value)}
                      placeholder={isPast ? 'Log a task…' : 'Add a task…'}
                      maxLength={200}
                      style={{
                        flex: 1, fontSize: 13, padding: '8px 14px',
                        borderRadius: 10, border: '1.5px solid var(--divider)',
                        background: 'var(--bg2)', color: 'var(--text)', outline: 'none',
                      }}
                      onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--divider)')}
                    />
                    <button
                      type="submit" disabled={addLoading || !addTitle.trim()}
                      style={{
                        flexShrink: 0, padding: '8px 16px', borderRadius: 10, fontSize: 13,
                        fontWeight: 500, background: 'var(--accent)', color: '#fff',
                        cursor: 'pointer', opacity: addLoading || !addTitle.trim() ? 0.4 : 1,
                      }}
                    >
                      {addLoading ? '…' : 'Add'}
                    </button>
                  </div>
                  {addError && <p style={{ marginTop: 6, fontSize: 11, color: '#dc2626' }}>{addError}</p>}
                </form>
              </div>

            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}
