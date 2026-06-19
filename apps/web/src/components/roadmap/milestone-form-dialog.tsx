'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import type { Milestone, MilestoneStatus } from '@flou/shared'
import { apiFetch } from '@/lib/auth'
import { useSpaces } from '@/components/spaces/space-context'

const STATUSES: { value: MilestoneStatus; label: string }[] = [
  { value: 'PLANNED', label: 'Planned' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'DONE', label: 'Done' },
]

export function MilestoneFormDialog({
  open, onClose, onSaved, milestone, defaultSpaceId,
}: {
  open: boolean
  onClose: () => void
  onSaved: () => void
  milestone?: Milestone | null
  defaultSpaceId?: string | null
}) {
  const { spaces } = useSpaces()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<MilestoneStatus>('PLANNED')
  const [targetDate, setTargetDate] = useState('')
  const [spaceId, setSpaceId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setTitle(milestone?.title ?? '')
      setDescription(milestone?.description ?? '')
      setStatus(milestone?.status ?? 'PLANNED')
      setTargetDate(milestone?.targetDate ?? '')
      setSpaceId(milestone ? milestone.spaceId : (defaultSpaceId ?? null))
      setError(null)
    }
  }, [open, milestone, defaultSpaceId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    setSaving(true)
    setError(null)
    const body = { title: title.trim(), description: description.trim() || null, status, targetDate: targetDate || null, spaceId }
    try {
      const res = milestone
        ? await apiFetch(`/api/milestones/${milestone.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        : await apiFetch('/api/milestones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.message ?? 'Could not save'); return }
      onSaved(); onClose()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!milestone) return
    setDeleting(true)
    try {
      const res = await apiFetch(`/api/milestones/${milestone.id}`, { method: 'DELETE' })
      if (res.ok) { onSaved(); onClose() }
    } finally {
      setDeleting(false)
    }
  }

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text2)', marginBottom: 6 }
  const fieldStyle: React.CSSProperties = {
    width: '100%', fontSize: 13, padding: '8px 12px', borderRadius: 10,
    border: '1px solid var(--divider)', background: 'var(--bg2)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0" style={{ background: 'rgba(15,12,10,0.5)', backdropFilter: 'blur(4px)' }} />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-2xl p-5" style={{ background: 'var(--bg)', boxShadow: 'var(--shadow)' }}>
          <DialogTitle className="mb-4 text-[15px] font-medium" style={{ color: 'var(--text)' }}>
            {milestone ? 'Edit milestone' : 'New milestone'}
          </DialogTitle>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label style={labelStyle}>Title</label>
              <input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. v2 Launch" style={fieldStyle} />
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} style={{ ...fieldStyle, resize: 'vertical' }} />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label style={labelStyle}>Target date</label>
                <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} style={fieldStyle} />
              </div>
              <div className="flex-1">
                <label style={labelStyle}>Space</label>
                <select value={spaceId ?? ''} onChange={e => setSpaceId(e.target.value || null)} style={{ ...fieldStyle, appearance: 'auto' as React.CSSProperties['appearance'] }}>
                  <option value="">No space</option>
                  {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Status</label>
              <div className="flex gap-2">
                {STATUSES.map(s => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setStatus(s.value)}
                    className="flex-1 rounded-lg px-2 py-2 text-[12px] font-medium"
                    style={{
                      background: status === s.value ? 'var(--bg3)' : 'var(--bg2)',
                      color: status === s.value ? 'var(--text)' : 'var(--text3)',
                      border: status === s.value ? '1px solid var(--accent)' : '1px solid var(--divider)',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-[12px]" style={{ color: 'var(--rose)' }}>{error}</p>}

            <div className="mt-1 flex items-center gap-2">
              {milestone && (
                <button type="button" onClick={handleDelete} disabled={deleting}
                  className="rounded-xl px-3 py-2 text-[13px] font-medium disabled:opacity-50"
                  style={{ color: '#dc2626', border: '1px solid var(--divider)' }}>
                  {deleting ? '…' : 'Delete'}
                </button>
              )}
              <div className="flex-1" />
              <button type="button" onClick={onClose} className="rounded-xl px-3 py-2 text-[13px] font-medium" style={{ color: 'var(--text2)' }}>
                Cancel
              </button>
              <button type="submit" disabled={saving} className="rounded-xl px-4 py-2 text-[13px] font-medium text-white disabled:opacity-50" style={{ background: 'var(--accent)' }}>
                {saving ? 'Saving…' : milestone ? 'Save' : 'Create'}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
