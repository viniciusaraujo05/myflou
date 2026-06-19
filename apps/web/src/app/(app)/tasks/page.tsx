'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Task, Status } from '@flou/shared'
import { useSpaces } from '@/components/spaces/space-context'
import { TaskCreateDialog } from '@/components/ui/task-create-dialog'
import { TaskDetailDialog } from '@/components/ui/task-detail-dialog'
import { StatusManager } from '@/components/ui/status-manager'
import { TaskBoard } from '@/components/ui/task-board'
import { apiFetch } from '@/lib/auth'

type ViewMode = 'list' | 'board'

const WIDE_FROM = '1970-01-01'
const WIDE_TO = '2999-12-31'

export default function TasksPage() {
  const { spaces } = useSpaces()
  const searchParams = useSearchParams()
  const initialSpace = searchParams.get('space') ?? ''

  const [tasks, setTasks] = useState<Task[]>([])
  const [statuses, setStatuses] = useState<Status[]>([])
  const [spaceFilter, setSpaceFilter] = useState(initialSpace)
  const [view, setView] = useState<ViewMode>('list')
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [detailTask, setDetailTask] = useState<Task | null>(null)

  const spaceById = useMemo(() => new Map(spaces.map(s => [s.id, s])), [spaces])
  const statusById = useMemo(() => new Map(statuses.map(s => [s.id, s])), [statuses])

  useEffect(() => {
    let active = true
    setLoading(true)
    const qs = new URLSearchParams({ from: WIDE_FROM, to: WIDE_TO })
    if (spaceFilter) qs.set('space', spaceFilter)
    apiFetch(`/api/tasks?${qs}`)
      .then(r => (r.ok ? r.json() : []))
      .then((data: Task[]) => { if (active) { setTasks(data); setLoading(false) } })
    return () => { active = false }
  }, [spaceFilter])

  useEffect(() => {
    apiFetch('/api/statuses').then(r => (r.ok ? r.json() : [])).then(setStatuses)
  }, [])

  async function toggleTask(task: Task) {
    setTasks(prev => prev.map(t => (t.id === task.id ? { ...t, completed: !t.completed } : t)))
    const res = await apiFetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed }),
    })
    if (!res.ok) setTasks(prev => prev.map(t => (t.id === task.id ? { ...t, completed: task.completed } : t)))
  }

  async function moveTask(task: Task, statusId: string | null) {
    setTasks(prev => prev.map(t => (t.id === task.id ? { ...t, statusId } : t)))
    const res = await apiFetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statusId }),
    })
    if (!res.ok) setTasks(prev => prev.map(t => (t.id === task.id ? { ...t, statusId: task.statusId } : t)))
  }

  function handleCreated(task: Task) {
    // Respect the active space filter — only show it if it belongs here.
    if (!spaceFilter || task.spaceId === spaceFilter) {
      setTasks(prev => [task, ...prev])
    }
  }

  return (
    <div className="app-page flex-1 overflow-y-auto fade-in">
      <div className="app-page-header">
        <h1 className="app-page-title font-serif text-[34px] font-medium" style={{ color: 'var(--text)' }}>
          Tasks
        </h1>
        <div className="app-actions">
          <div className="flex overflow-hidden rounded-lg" style={{ border: '1px solid var(--divider)' }}>
            {(['list', 'board'] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-3 py-1.5 text-[12px] font-medium capitalize"
                style={{ background: view === v ? 'var(--accent)' : 'var(--bg)', color: view === v ? '#fff' : 'var(--text2)' }}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStatusOpen(true)}
            className="rounded-xl px-3 py-2 text-[13px] font-medium"
            style={{ background: 'var(--bg2)', color: 'var(--text2)' }}
          >
            Manage statuses
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="rounded-xl px-4 py-2 text-[13px] font-medium text-white"
            style={{ background: 'var(--accent)' }}
          >
            New task
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
      ) : view === 'board' ? (
        <TaskBoard
          tasks={tasks}
          statuses={statuses}
          spaceById={spaceById}
          onMove={moveTask}
          onOpen={setDetailTask}
        />
      ) : tasks.length === 0 ? (
        <p className="text-[13px]" style={{ color: 'var(--text3)' }}>No tasks yet. Create your first one.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {tasks.map(task => {
            const space = task.spaceId ? spaceById.get(task.spaceId) : undefined
            const status = task.statusId ? statusById.get(task.statusId) : undefined
            return (
              <div key={task.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: 'var(--bg2)' }}>
                <button
                  onClick={() => toggleTask(task)}
                  className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full"
                  style={{ border: `1.5px solid ${task.completed ? 'var(--accent)' : 'var(--bg3)'}`, background: task.completed ? 'var(--accent)' : 'transparent' }}
                  aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {task.completed && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1.5 5.5l2.5 2.5 4.5-5" />
                    </svg>
                  )}
                </button>

                <button onClick={() => setDetailTask(task)} className="flex-1 truncate text-left text-[13px]"
                  style={{ color: task.completed ? 'var(--text3)' : 'var(--text)', textDecoration: task.completed ? 'line-through' : 'none' }}>
                  {task.title}
                </button>

                {status && (
                  <span className="flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium"
                    style={{ background: status.color + '22', color: status.color }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: status.color }} />
                    {status.name}
                  </span>
                )}
                {space && (
                  <span className="flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium" style={{ background: 'var(--bg3)', color: 'var(--text2)' }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: space.color }} />
                    {space.name}
                  </span>
                )}
                <span className="text-[12px]" style={{ color: 'var(--text3)' }}>{task.date}</span>
              </div>
            )
          })}
        </div>
      )}

      <TaskCreateDialog
        open={createOpen}
        defaultSpaceId={spaceFilter || null}
        statuses={statuses}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
      <TaskDetailDialog
        task={detailTask}
        statuses={statuses}
        onClose={() => setDetailTask(null)}
        onUpdated={updated => setTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)))}
        onDeleted={deleted => setTasks(prev => prev.filter(t => t.id !== deleted.id))}
        onStatusesChange={setStatuses}
      />
      <StatusManager
        open={statusOpen}
        statuses={statuses}
        onClose={() => setStatusOpen(false)}
        onStatusesChange={setStatuses}
      />
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
