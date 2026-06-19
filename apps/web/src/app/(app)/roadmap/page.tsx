'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Milestone, MilestoneStatus } from '@flou/shared'
import { useSpaces } from '@/components/spaces/space-context'
import { MilestoneFormDialog } from '@/components/roadmap/milestone-form-dialog'
import { apiFetch } from '@/lib/auth'

const STATUS_META: Record<MilestoneStatus, { label: string; color: string }> = {
  PLANNED: { label: 'Planned', color: '#a3a3a3' },
  IN_PROGRESS: { label: 'In progress', color: '#0ea5e9' },
  DONE: { label: 'Done', color: '#10b981' },
}

export default function RoadmapPage() {
  const { spaces } = useSpaces()
  const searchParams = useSearchParams()
  const [spaceFilter, setSpaceFilter] = useState(searchParams.get('space') ?? '')
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Milestone | null>(null)

  const spaceById = useMemo(() => new Map(spaces.map(s => [s.id, s])), [spaces])

  function load() {
    setLoading(true)
    const qs = spaceFilter ? `?space=${spaceFilter}` : ''
    apiFetch(`/api/milestones${qs}`)
      .then(r => (r.ok ? r.json() : []))
      .then((data: Milestone[]) => { setMilestones(data); setLoading(false) })
  }

  useEffect(() => { load() }, [spaceFilter])

  return (
    <div className="app-page flex-1 overflow-y-auto fade-in">
      <div className="app-page-header">
        <h1 className="app-page-title font-serif text-[34px] font-medium" style={{ color: 'var(--text)' }}>Roadmap</h1>
        <div className="app-actions">
          <button onClick={() => setCreateOpen(true)} className="rounded-xl px-4 py-2 text-[13px] font-medium text-white" style={{ background: 'var(--accent)' }}>
            New milestone
          </button>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <FilterPill label="All spaces" active={spaceFilter === ''} onClick={() => setSpaceFilter('')} />
        {spaces.map(s => (
          <FilterPill key={s.id} label={s.name} color={s.color} active={spaceFilter === s.id} onClick={() => setSpaceFilter(s.id)} />
        ))}
      </div>

      {loading ? (
        <p className="text-[13px]" style={{ color: 'var(--text3)' }}>Loading…</p>
      ) : milestones.length === 0 ? (
        <p className="text-[13px]" style={{ color: 'var(--text3)' }}>No milestones yet. Create one to start your roadmap.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {milestones.map(m => {
            const space = m.spaceId ? spaceById.get(m.spaceId) : undefined
            const meta = STATUS_META[m.status]
            const pct = m.taskCount ? Math.round((m.completedCount / m.taskCount) * 100) : 0
            return (
              <button
                key={m.id}
                onClick={() => setEditing(m)}
                className="flex flex-col gap-2.5 rounded-2xl p-4 text-left transition-transform hover:-translate-y-0.5"
                style={{ background: 'var(--bg2)', boxShadow: 'var(--shadow)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta.color }} />
                  <span className="flex-1 text-[15px] font-medium" style={{ color: 'var(--text)' }}>{m.title}</span>
                  {space && (
                    <span className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium" style={{ background: 'var(--bg3)', color: 'var(--text2)' }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: space.color }} />
                      {space.name}
                    </span>
                  )}
                  <span className="rounded-md px-2 py-0.5 text-[11px] font-medium" style={{ background: meta.color + '22', color: meta.color }}>
                    {meta.label}
                  </span>
                </div>

                {m.description && <p className="text-[13px]" style={{ color: 'var(--text2)' }}>{m.description}</p>}

                <div className="flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--bg3)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: meta.color }} />
                  </div>
                  <span className="text-[12px] tabular-nums" style={{ color: 'var(--text3)' }}>
                    {m.completedCount}/{m.taskCount} · {pct}%
                  </span>
                  {m.targetDate && (
                    <span className="text-[12px]" style={{ color: 'var(--text3)' }}>{m.targetDate}</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      <MilestoneFormDialog open={createOpen} defaultSpaceId={spaceFilter || null} onClose={() => setCreateOpen(false)} onSaved={load} />
      <MilestoneFormDialog open={editing !== null} milestone={editing} onClose={() => setEditing(null)} onSaved={load} />
    </div>
  )
}

function FilterPill({ label, color, active, onClick }: { label: string; color?: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors"
      style={{ background: active ? 'var(--bg3)' : 'var(--bg2)', color: active ? 'var(--text)' : 'var(--text2)' }}
    >
      {color && <span className="h-2 w-2 rounded-full" style={{ background: color }} />}
      {label}
    </button>
  )
}
