'use client'

import { useCallback, useEffect, useState } from 'react'
import type { RelatedResource, ResourceType } from '@flou/shared'
import { apiFetch } from '@/lib/auth'

const WIDE = 'from=1970-01-01&to=2999-12-31'

const TYPE_LABEL: Record<ResourceType, string> = {
  TASK: 'Task', NOTE: 'Note', LINK: 'Link', CREDENTIAL: 'Password',
  TRANSACTION: 'Transaction', SUBSCRIPTION: 'Subscription', MILESTONE: 'Milestone',
}

// Types you can link to, with how to fetch their pick-list.
const PICKABLE: { type: ResourceType; endpoint: string; label: (x: Record<string, unknown>) => string }[] = [
  { type: 'NOTE', endpoint: '/api/notes', label: x => String(x.title ?? 'Untitled') },
  { type: 'LINK', endpoint: '/api/links', label: x => String(x.title ?? '') },
  { type: 'CREDENTIAL', endpoint: '/api/credentials', label: x => String(x.service ?? '') },
  { type: 'TRANSACTION', endpoint: `/api/transactions?${WIDE}`, label: x => `${x.category ?? ''} · ${x.amount ?? ''}` },
  { type: 'SUBSCRIPTION', endpoint: '/api/subscriptions', label: x => String(x.name ?? '') },
  { type: 'MILESTONE', endpoint: '/api/milestones', label: x => String(x.title ?? '') },
  { type: 'TASK', endpoint: `/api/tasks?${WIDE}`, label: x => String(x.title ?? '') },
]

export function RelatedPanel({ anchorType, anchorId }: { anchorType: ResourceType; anchorId: string }) {
  const [related, setRelated] = useState<RelatedResource[]>([])
  const [adding, setAdding] = useState(false)
  const [pickType, setPickType] = useState<ResourceType>('NOTE')
  const [options, setOptions] = useState<{ id: string; label: string }[]>([])
  const [optLoading, setOptLoading] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    apiFetch(`/api/relations?type=${anchorType}&id=${anchorId}`)
      .then(r => (r.ok ? r.json() : []))
      .then(setRelated)
  }, [anchorType, anchorId])

  useEffect(() => { load() }, [load])

  const loadOptions = useCallback(async (type: ResourceType) => {
    const cfg = PICKABLE.find(p => p.type === type)!
    setOptLoading(true)
    try {
      const res = await apiFetch(cfg.endpoint)
      const data: Record<string, unknown>[] = res.ok ? await res.json() : []
      const relatedIds = new Set(related.map(r => r.id))
      setOptions(
        data
          .filter(x => !(type === anchorType && x.id === anchorId) && !relatedIds.has(String(x.id)))
          .map(x => ({ id: String(x.id), label: cfg.label(x) })),
      )
    } finally {
      setOptLoading(false)
    }
  }, [related, anchorType, anchorId])

  useEffect(() => { if (adding) void loadOptions(pickType) }, [adding, pickType, loadOptions])

  async function link(toId: string) {
    setBusy(true)
    try {
      const res = await apiFetch('/api/relations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromType: anchorType, fromId: anchorId, toType: pickType, toId }),
      })
      if (res.ok) { setAdding(false); load() }
    } finally {
      setBusy(false)
    }
  }

  async function remove(linkId: string) {
    setRelated(prev => prev.filter(r => r.linkId !== linkId))
    await apiFetch(`/api/relations/${linkId}`, { method: 'DELETE' })
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <label style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)' }}>
          Related
        </label>
        <button type="button" onClick={() => setAdding(v => !v)}
          style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, cursor: 'pointer', border: '1px solid var(--divider)', color: 'var(--text3)', background: 'transparent' }}>
          {adding ? 'Close' : '+ Link'}
        </button>
      </div>

      {related.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: adding ? 10 : 0 }}>
          {related.map(r => (
            <div key={r.linkId} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8, background: 'var(--bg2)' }}>
              <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: 'var(--bg3)', color: 'var(--text2)' }}>
                {TYPE_LABEL[r.type]}
              </span>
              <span style={{ flex: 1, fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</span>
              <button type="button" onClick={() => remove(r.linkId)} aria-label="Remove link"
                style={{ padding: 3, borderRadius: 6, color: 'var(--text3)', cursor: 'pointer', background: 'transparent', border: 'none' }}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M2 2l12 12M14 2L2 14" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <select value={pickType} onChange={e => setPickType(e.target.value as ResourceType)}
            style={{ fontSize: 12, padding: '7px 8px', borderRadius: 8, border: '1px solid var(--divider)', background: 'var(--bg2)', color: 'var(--text)' }}>
            {PICKABLE.map(p => <option key={p.type} value={p.type}>{TYPE_LABEL[p.type]}</option>)}
          </select>
          <select
            disabled={optLoading || busy}
            defaultValue=""
            onChange={e => { if (e.target.value) void link(e.target.value) }}
            style={{ flex: 1, fontSize: 12, padding: '7px 8px', borderRadius: 8, border: '1px solid var(--divider)', background: 'var(--bg2)', color: 'var(--text)' }}>
            <option value="" disabled>{optLoading ? 'Loading…' : options.length ? 'Select…' : 'Nothing to link'}</option>
            {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </div>
      )}

      {related.length === 0 && !adding && (
        <p style={{ fontSize: 12, color: 'var(--text3)' }}>Nothing linked yet.</p>
      )}
    </div>
  )
}
