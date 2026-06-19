'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import type { Task, NoteSummary, Link as LinkType, Credential, Subscription, TimeSummary, ActivityEvent } from '@flou/shared'
import { useSpaces } from '@/components/spaces/space-context'
import { SpaceFormDialog } from '@/components/spaces/space-form-dialog'
import { apiFetch } from '@/lib/auth'

const WIDE_FROM = '1970-01-01'
const WIDE_TO = '2999-12-31'
const PREVIEW = 3

interface SpaceData {
  tasks: Task[]
  notes: NoteSummary[]
  links: LinkType[]
  credentials: Credential[]
  subscriptions: Subscription[]
}

const EMPTY: SpaceData = { tasks: [], notes: [], links: [], credentials: [], subscriptions: [] }

async function getList<T>(path: string): Promise<T[]> {
  const res = await apiFetch(path)
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

function daysAgoStr(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function fmtHours(h: number): string {
  return h % 1 === 0 ? String(h) : h.toFixed(1)
}

function fmtDur(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (h === 0 && m === 0) return '0m'
  return [h ? `${h}h` : '', m ? `${m}m` : ''].filter(Boolean).join(' ')
}

const ACTION_LABEL: Record<string, string> = { CREATED: 'Created', UPDATED: 'Updated', COMPLETED: 'Completed', DELETED: 'Deleted' }
const ACTION_COLOR: Record<string, string> = { CREATED: '#10b981', UPDATED: '#0ea5e9', COMPLETED: '#6366f1', DELETED: '#ef4444' }
const RESOURCE_LABEL: Record<string, string> = {
  TASK: 'task', NOTE: 'note', LINK: 'link', CREDENTIAL: 'password',
  TRANSACTION: 'transaction', SUBSCRIPTION: 'subscription', MILESTONE: 'milestone',
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString()
}

function computeInsights(tasks: Task[]) {
  const since7 = daysAgoStr(7)
  const since30 = daysAgoStr(30)
  const completed = tasks.filter(t => t.completed)
  const totalHours = tasks.reduce((s, t) => s + (t.hoursSpent ?? 0), 0)
  return {
    open: tasks.length - completed.length,
    completed: completed.length,
    completionPct: tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0,
    totalHours,
    done30: completed.filter(t => t.date >= since30).length,
    hours7: tasks.filter(t => t.date >= since7).reduce((s, t) => s + (t.hoursSpent ?? 0), 0),
  }
}

export default function SpaceOverviewPage() {
  const { id } = useParams<{ id: string }>()
  const { spaces, refresh } = useSpaces()
  const space = spaces.find(s => s.id === id)

  const [data, setData] = useState<SpaceData>(EMPTY)
  const [summary, setSummary] = useState<TimeSummary | null>(null)
  const [activity, setActivity] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([
      getList<Task>(`/api/tasks?from=${WIDE_FROM}&to=${WIDE_TO}&space=${id}`),
      getList<NoteSummary>(`/api/notes?space=${id}`),
      getList<LinkType>(`/api/links?space=${id}`),
      getList<Credential>(`/api/credentials?space=${id}`),
      getList<Subscription>(`/api/subscriptions?space=${id}`),
    ]).then(([tasks, notes, links, credentials, subscriptions]) => {
      if (active) {
        setData({ tasks, notes, links, credentials, subscriptions })
        setLoading(false)
      }
    })
    return () => { active = false }
  }, [id])

  useEffect(() => {
    apiFetch(`/api/time-sessions/summary?space=${id}`).then(r => (r.ok ? r.json() : null)).then(setSummary)
    apiFetch(`/api/activity?space=${id}&limit=15`).then(r => (r.ok ? r.json() : [])).then(setActivity)
  }, [id])

  const insights = useMemo(() => computeInsights(data.tasks), [data.tasks])

  if (spaces.length > 0 && !space) notFound()

  return (
    <div className="app-page flex-1 overflow-y-auto fade-in">
      <div className="app-page-header">
        <div className="flex items-center gap-3">
          <span className="h-3.5 w-3.5 rounded-full" style={{ background: space?.color ?? 'var(--text3)' }} />
          <h1 className="app-page-title font-serif text-[34px] font-medium" style={{ color: 'var(--text)' }}>
            {space?.name ?? 'Space'}
          </h1>
        </div>
        {space && (
          <div className="app-actions">
            <Link href={`/tasks?space=${id}`} className="rounded-xl px-3 py-2 text-[13px] font-medium" style={{ background: 'var(--accent)', color: '#fff' }}>
              Open tasks
            </Link>
            <Link href={`/roadmap?space=${id}`} className="rounded-xl px-3 py-2 text-[13px] font-medium" style={{ background: 'var(--bg2)', color: 'var(--text2)' }}>
              Roadmap
            </Link>
            <button onClick={() => setEditing(true)} className="rounded-xl px-3 py-2 text-[13px] font-medium" style={{ background: 'var(--bg2)', color: 'var(--text2)' }}>
              Edit space
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-[13px]" style={{ color: 'var(--text3)' }}>Loading…</p>
      ) : (
        <>
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Open tasks" value={insights.open} />
          <Stat label="Completed" value={insights.completed} />
          <Stat label="Completion" value={`${insights.completionPct}%`} />
          <Stat label="Total hours" value={fmtHours(insights.totalHours)} />
          <Stat label="Done · 30d" value={insights.done30} />
          <Stat label="Hours · 7d" value={fmtHours(insights.hours7)} />
        </div>

        {summary && (
          <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-1 rounded-xl px-4 py-3 text-[13px]" style={{ background: 'var(--bg2)' }}>
            <span className="text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--text3)' }}>Focus time</span>
            <span style={{ color: 'var(--text2)' }}>Today <strong style={{ color: 'var(--text)' }}>{fmtDur(summary.todaySec)}</strong></span>
            <span style={{ color: 'var(--text2)' }}>This week <strong style={{ color: 'var(--text)' }}>{fmtDur(summary.weekSec)}</strong></span>
            <span style={{ color: 'var(--text2)' }}>This month <strong style={{ color: 'var(--text)' }}>{fmtDur(summary.monthSec)}</strong></span>
          </div>
        )}

        <div className="responsive-card-grid-wide">
          <Section title="Tasks" count={data.tasks.length} href={`/tasks?space=${id}`}
            items={data.tasks} render={t => (
              <span style={{ textDecoration: t.completed ? 'line-through' : 'none', color: t.completed ? 'var(--text3)' : 'var(--text)' }}>{t.title}</span>
            )} />
          <Section title="Notes" count={data.notes.length} href="/notes"
            items={data.notes} render={n => <span style={{ color: 'var(--text)' }}>{n.title}</span>} />
          <Section title="Links" count={data.links.length} href="/links"
            items={data.links} render={l => <span style={{ color: 'var(--text)' }}>{l.title}</span>} />
          <Section title="Passwords" count={data.credentials.length} href="/passwords"
            items={data.credentials} render={c => <span style={{ color: 'var(--text)' }}>{c.service}</span>} />
          <Section title="Subscriptions" count={data.subscriptions.length} href="/finance"
            items={data.subscriptions} render={s => <span style={{ color: 'var(--text)' }}>{s.name}</span>} />
        </div>

        <div className="mt-8">
          <p className="mb-3 text-[12px] font-medium uppercase tracking-wide" style={{ color: 'var(--text3)' }}>Activity</p>
          {activity.length === 0 ? (
            <p className="text-[13px]" style={{ color: 'var(--text3)' }}>No activity yet.</p>
          ) : (
            <ul className="flex flex-col">
              {activity.map((e, i) => (
                <li key={e.id} className="flex items-center gap-3 py-2" style={{ borderTop: i === 0 ? 'none' : '1px solid var(--divider)' }}>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: ACTION_COLOR[e.action] }} />
                  <span className="flex-1 text-[13px]" style={{ color: 'var(--text)' }}>
                    <span style={{ color: 'var(--text2)' }}>{ACTION_LABEL[e.action]} {RESOURCE_LABEL[e.resourceType]} · </span>
                    {e.title}
                  </span>
                  <span className="shrink-0 text-[12px]" style={{ color: 'var(--text3)' }}>{relativeTime(e.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        </>
      )}

      {space && <SpaceFormDialog open={editing} onClose={() => setEditing(false)} onSaved={refresh} space={space} />}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl p-3" style={{ background: 'var(--bg2)' }}>
      <span className="text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--text3)' }}>{label}</span>
      <span className="font-serif text-[24px] font-medium" style={{ color: 'var(--text)' }}>{value}</span>
    </div>
  )
}

function Section<T extends { id: string }>({
  title, count, href, items, render,
}: {
  title: string
  count: number
  href: string
  items: T[]
  render: (item: T) => React.ReactNode
}) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? items : items.slice(0, PREVIEW)
  const hidden = count - PREVIEW

  return (
    <div className="flex flex-col gap-3 rounded-2xl p-4" style={{ background: 'var(--bg2)', boxShadow: 'var(--shadow)' }}>
      <div className="flex items-center justify-between">
        <Link href={href} className="text-[12px] font-medium uppercase tracking-wide" style={{ color: 'var(--text3)' }}>
          {title}
        </Link>
        <span className="font-serif text-[18px] font-medium" style={{ color: 'var(--text)' }}>{count}</span>
      </div>

      {count === 0 ? (
        <p className="text-[12px]" style={{ color: 'var(--text3)' }}>Nothing here yet.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {visible.map(item => (
            <li key={item.id} className="truncate rounded-lg px-2 py-1.5 text-[13px]" style={{ background: 'var(--bg)' }}>
              {render(item)}
            </li>
          ))}
        </ul>
      )}

      {hidden > 0 && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="self-start text-[12px] font-medium"
          style={{ color: 'var(--accent)' }}
        >
          {expanded ? 'Show less' : `Show all (${count})`}
        </button>
      )}
    </div>
  )
}
