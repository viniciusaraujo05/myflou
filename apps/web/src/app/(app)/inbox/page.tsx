'use client'

import { useEffect, useState } from 'react'
import type { InboxItem } from '@flou/shared'
import { useSpaces } from '@/components/spaces/space-context'
import { apiFetch } from '@/lib/auth'

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function InboxPage() {
  const { spaces } = useSpaces()
  const [items, setItems] = useState<InboxItem[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  function load() {
    setLoading(true)
    apiFetch('/api/inbox?status=PENDING')
      .then(r => (r.ok ? r.json() : []))
      .then((data: InboxItem[]) => { setItems(data); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  async function add(e: React.FormEvent) {
    e.preventDefault()
    const content = draft.trim()
    if (!content) return
    setAdding(true)
    try {
      const res = await apiFetch('/api/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (res.ok) { const created: InboxItem = await res.json(); setItems(prev => [created, ...prev]); setDraft('') }
    } finally {
      setAdding(false)
    }
  }

  async function setStatus(item: InboxItem, status: 'PROCESSED' | 'DISMISSED') {
    setItems(prev => prev.filter(i => i.id !== item.id))
    await apiFetch(`/api/inbox/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  }

  async function triage(item: InboxItem, type: 'task' | 'note', spaceId: string | null) {
    const body = type === 'task'
      ? { title: item.content.slice(0, 200), date: todayStr(), spaceId }
      : { title: item.content.slice(0, 200), spaceId }
    const res = await apiFetch(type === 'task' ? '/api/tasks' : '/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) await setStatus(item, 'PROCESSED')
  }

  return (
    <div className="app-page flex-1 overflow-y-auto fade-in">
      <div className="app-page-header">
        <h1 className="app-page-title font-serif text-[34px] font-medium" style={{ color: 'var(--text)' }}>Inbox</h1>
      </div>

      {/* Capture box */}
      <form onSubmit={add} className="mb-6">
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') add(e) }}
          placeholder="What do you want to save? Paste anything — triage it into a Space later."
          rows={3}
          className="w-full rounded-2xl p-4 text-[14px] outline-none"
          style={{ background: 'var(--bg2)', color: 'var(--text)', border: '1px solid var(--divider)' }}
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px]" style={{ color: 'var(--text3)' }}>⌘/Ctrl + Enter to add</span>
          <button type="submit" disabled={adding || !draft.trim()}
            className="rounded-xl px-4 py-2 text-[13px] font-medium text-white disabled:opacity-50" style={{ background: 'var(--accent)' }}>
            {adding ? 'Adding…' : 'Add to inbox'}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-[13px]" style={{ color: 'var(--text3)' }}>Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-[13px]" style={{ color: 'var(--text3)' }}>Inbox zero. Nothing to triage.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map(item => (
            <InboxRow key={item.id} item={item} spaces={spaces} onTriage={triage} onDismiss={() => setStatus(item, 'DISMISSED')} />
          ))}
        </div>
      )}
    </div>
  )
}

function InboxRow({
  item, spaces, onTriage, onDismiss,
}: {
  item: InboxItem
  spaces: { id: string; name: string; color: string }[]
  onTriage: (item: InboxItem, type: 'task' | 'note', spaceId: string | null) => void
  onDismiss: () => void
}) {
  const [spaceId, setSpaceId] = useState<string | null>(spaces[0]?.id ?? null)
  const [busy, setBusy] = useState(false)

  async function run(type: 'task' | 'note') {
    setBusy(true)
    try { await onTriage(item, type, spaceId) } finally { setBusy(false) }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl p-4" style={{ background: 'var(--bg2)' }}>
      <p className="whitespace-pre-wrap text-[14px]" style={{ color: 'var(--text)' }}>{item.content}</p>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={spaceId ?? ''}
          onChange={e => setSpaceId(e.target.value || null)}
          className="rounded-lg px-2.5 py-1.5 text-[12px]"
          style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--divider)' }}
        >
          <option value="">No space</option>
          {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button onClick={() => run('task')} disabled={busy}
          className="rounded-lg px-3 py-1.5 text-[12px] font-medium text-white disabled:opacity-50" style={{ background: 'var(--accent)' }}>
          → Task
        </button>
        <button onClick={() => run('note')} disabled={busy}
          className="rounded-lg px-3 py-1.5 text-[12px] font-medium" style={{ background: 'var(--bg3)', color: 'var(--text)' }}>
          → Note
        </button>
        <div className="flex-1" />
        <button onClick={onDismiss} disabled={busy}
          className="rounded-lg px-3 py-1.5 text-[12px] font-medium" style={{ color: 'var(--text3)' }}>
          Dismiss
        </button>
      </div>
    </div>
  )
}
