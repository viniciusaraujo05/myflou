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

  // Format date label for the header
  const dateLabel = (() => {
    try {
      const [y, m, d] = date.split('-').map(Number)
      return new Date(y!, m! - 1, d!).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
      })
    } catch { return date }
  })()

  return (
    <Transition show={open}>
      <Dialog onClose={onClose} className="relative z-50" initialFocus={inputRef}>

        {/* Backdrop */}
        <TransitionChild
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-stone-900/25 backdrop-blur-[2px]" aria-hidden="true" />
        </TransitionChild>

        {/* Panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-[0.97] translate-y-1"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-[0.97]"
          >
            <DialogPanel className="w-full max-w-[400px] overflow-hidden rounded-2xl bg-white shadow-2xl shadow-stone-900/10 ring-1 ring-stone-900/5">

              {/* Warm header strip */}
              <div className="bg-[#f5f0eb] px-6 py-5">
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400">
                      New task
                    </DialogTitle>
                    <p className="mt-0.5 text-[13px] font-medium text-stone-600">{dateLabel}</p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-0.5 rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-200/60 hover:text-stone-600"
                    aria-label="Close"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2 2l12 12M14 2L2 14" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Form body */}
              <div className="p-6">
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  {error && (
                    <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-[12px] text-red-600" role="alert">
                      {error}
                    </p>
                  )}

                  {/* Title input — primary focus */}
                  <input
                    ref={inputRef}
                    id="task-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    maxLength={200}
                    className="w-full border-0 border-b-2 border-stone-200 bg-transparent pb-2 text-[16px] font-medium text-stone-800 placeholder-stone-300 outline-none transition-colors focus:border-indigo-500"
                  />

                  {/* Date picker */}
                  <div className="space-y-1.5">
                    <label htmlFor="task-date" className="block text-[11px] font-medium text-stone-400">
                      Date
                    </label>
                    <input
                      id="task-date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-[13px] text-stone-700 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 rounded-xl border border-stone-200 py-2.5 text-[13px] font-medium text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !title.trim()}
                      className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-[13px] font-medium text-white transition-all hover:bg-indigo-700 disabled:opacity-40"
                    >
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
