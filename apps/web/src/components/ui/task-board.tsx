'use client'

import { useMemo, useState } from 'react'
import type { Task, Status, Space } from '@flou/shared'

interface Column { id: string | null; name: string; color: string | null }

interface TaskBoardProps {
  tasks: Task[]
  statuses: Status[]
  spaceById: Map<string, Space>
  /** Persist a card's new status (null = No status). */
  onMove: (task: Task, statusId: string | null) => void
  onOpen: (task: Task) => void
}

export function TaskBoard({ tasks, statuses, spaceById, onMove, onOpen }: TaskBoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overCol, setOverCol] = useState<string | null | undefined>(undefined)

  const columns: Column[] = useMemo(
    () => [
      ...statuses.map(s => ({ id: s.id, name: s.name, color: s.color })),
      { id: null, name: 'No status', color: null },
    ],
    [statuses],
  )

  const byColumn = useMemo(() => {
    const map = new Map<string | null, Task[]>()
    for (const col of columns) map.set(col.id, [])
    for (const t of tasks) {
      const key = t.statusId && map.has(t.statusId) ? t.statusId : null
      map.get(key)!.push(t)
    }
    return map
  }, [tasks, columns])

  function handleDrop(colId: string | null) {
    setOverCol(undefined)
    const id = draggingId
    setDraggingId(null)
    if (!id) return
    const task = tasks.find(t => t.id === id)
    if (task && (task.statusId ?? null) !== colId) onMove(task, colId)
  }

  if (statuses.length === 0) {
    return (
      <p className="text-[13px]" style={{ color: 'var(--text3)' }}>
        Create a status with “Manage statuses” to use the board.
      </p>
    )
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {columns.map(col => {
        const colKey = col.id ?? '__none__'
        const colTasks = byColumn.get(col.id) ?? []
        const isOver = overCol === col.id
        return (
          <div
            key={colKey}
            onDragOver={e => { e.preventDefault(); setOverCol(col.id) }}
            onDragLeave={() => setOverCol(prev => (prev === col.id ? undefined : prev))}
            onDrop={() => handleDrop(col.id)}
            className="flex w-[260px] shrink-0 flex-col gap-2 rounded-2xl p-3"
            style={{ background: 'var(--bg2)', outline: isOver ? '2px solid var(--accent)' : 'none' }}
          >
            <div className="flex items-center gap-2 px-1">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: col.color ?? 'var(--text3)' }} />
              <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text2)' }}>
                {col.name}
              </span>
              <span className="text-[11px]" style={{ color: 'var(--text3)' }}>{colTasks.length}</span>
            </div>

            <div className="flex flex-col gap-2">
              {colTasks.map(task => {
                const space = task.spaceId ? spaceById.get(task.spaceId) : undefined
                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => setDraggingId(task.id)}
                    onDragEnd={() => { setDraggingId(null); setOverCol(undefined) }}
                    onClick={() => onOpen(task)}
                    className="cursor-grab rounded-xl p-3 active:cursor-grabbing"
                    style={{ background: 'var(--bg)', boxShadow: 'var(--shadow)', opacity: draggingId === task.id ? 0.4 : 1 }}
                  >
                    <p className="mb-2 text-[13px]" style={{ color: task.completed ? 'var(--text3)' : 'var(--text)', textDecoration: task.completed ? 'line-through' : 'none' }}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2">
                      {space && (
                        <span className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium" style={{ background: 'var(--bg3)', color: 'var(--text2)' }}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: space.color }} />
                          {space.name}
                        </span>
                      )}
                      {task.hoursSpent != null && (
                        <span className="text-[10px]" style={{ color: 'var(--text3)' }}>
                          {task.hoursSpent % 1 === 0 ? task.hoursSpent : task.hoursSpent.toFixed(1)}h
                        </span>
                      )}
                      <span className="ml-auto text-[10px]" style={{ color: 'var(--text3)' }}>{task.date.slice(5)}</span>
                    </div>
                  </div>
                )
              })}
              {colTasks.length === 0 && (
                <p className="px-1 py-2 text-[12px]" style={{ color: 'var(--text3)' }}>—</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
