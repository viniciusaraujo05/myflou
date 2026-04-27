'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { Task, Status } from '@flou/shared'
import { DayDetailDialog } from '@/components/ui/day-detail-dialog'
import { TaskDetailDialog } from '@/components/ui/task-detail-dialog'
import { apiFetch } from '@/lib/auth'

// ─── Date helpers ─────────────────────────────────────────────────────────────

function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${mo}-${day}`
}

function parseLocalDate(iso: string): Date {
  const [y, m, day] = iso.split('-').map(Number)
  return new Date(y!, m! - 1, day!)
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

function startOfWeek(d: Date): Date {
  const diff = (d.getDay() + 6) % 7
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff)
}

function buildCalendarGrid(month: Date): Date[] {
  const first = startOfMonth(month)
  const last = endOfMonth(month)
  const leadingDays = (first.getDay() + 6) % 7
  const days: Date[] = []
  for (let i = leadingDays; i > 0; i--) days.push(addDays(first, -i))
  for (let d = new Date(first); d <= last; d = addDays(d, 1)) days.push(new Date(d))
  const trailing = 42 - days.length
  for (let i = 1; i <= trailing; i++) days.push(addDays(last, i))
  return days
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

type ViewMode = 'month' | 'week'

// ─── CheckCircle ─────────────────────────────────────────────────────────────

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

// ─── Main ─────────────────────────────────────────────────────────────────────

export function CalendarView() {
  const today = useMemo(() => new Date(), [])
  const todayStr = useMemo(() => toDateStr(today), [today])

  const [view, setView] = useState<ViewMode>('month')
  const [month, setMonth] = useState<Date>(() => startOfMonth(today))
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(today))
  const [tasks, setTasks] = useState<Task[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogDate, setDialogDate] = useState<string>(todayStr)
  const [selectedDate, setSelectedDate] = useState<string>(todayStr)
  const [statuses, setStatuses] = useState<Status[]>([])
  const [detailTask, setDetailTask] = useState<Task | null>(null)
  const [addTitle, setAddTitle] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const addInputRef = useRef<HTMLInputElement>(null)
  const rightPanelRef = useRef<HTMLDivElement>(null)

  const fetchTasks = useCallback(async (from: string, to: string) => {
    setLoading(true)
    try {
      const res = await apiFetch(`/api/tasks?from=${from}&to=${to}`, { cache: 'no-store' })
      if (res.ok) setTasks(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (view === 'month') {
      const from = toDateStr(startOfMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1)))
      const to = toDateStr(endOfMonth(new Date(month.getFullYear(), month.getMonth() + 1, 0)))
      fetchTasks(from, to)
    } else {
      fetchTasks(toDateStr(weekStart), toDateStr(addDays(weekStart, 6)))
    }
  }, [view, month, weekStart, fetchTasks])

  useEffect(() => {
    apiFetch('/api/statuses').then(r => r.ok ? r.json() : []).then(setStatuses)
  }, [])

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const t of tasks) {
      const list = map.get(t.date) ?? []
      list.push(t)
      map.set(t.date, list)
    }
    return map
  }, [tasks])

  const calendarGrid = useMemo(() => buildCalendarGrid(month), [month])
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  )

  const selectedTasks = tasksByDate.get(selectedDate) ?? []
  const selectedDateObj = parseLocalDate(selectedDate)
  const selectedDayNum = selectedDateObj.getDate()
  const selectedMonthName = MONTH_NAMES[selectedDateObj.getMonth()]
  const selectedYear = selectedDateObj.getFullYear()

  const upNext = useMemo(() => {
    const upcoming: { date: string; task: Task }[] = []
    for (const [date, dayTasks] of tasksByDate.entries()) {
      if (date > todayStr) {
        for (const t of dayTasks) {
          if (!t.completed) upcoming.push({ date, task: t })
        }
      }
    }
    upcoming.sort((a, b) => a.date.localeCompare(b.date))
    return upcoming.slice(0, 3)
  }, [tasksByDate, todayStr])

  function handleDayClick(day: Date) {
    const ds = toDateStr(day)
    setSelectedDate(ds)
    const panelVisible =
      rightPanelRef.current &&
      window.getComputedStyle(rightPanelRef.current).display !== 'none'
    if (panelVisible) {
      setTimeout(() => addInputRef.current?.focus(), 50)
    } else {
      setDialogDate(ds)
      setDialogOpen(true)
    }
  }

  function handleTaskCreated(task: Task) {
    setTasks(prev => [...prev, task].sort((a, b) => a.date.localeCompare(b.date)))
  }

  function handleTaskUpdated(updated: Task) {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
  }

  function handleTaskDeleted(deleted: Task) {
    setTasks(prev => prev.filter(t => t.id !== deleted.id))
  }

  async function toggleTask(task: Task) {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))
    const res = await apiFetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed }),
    })
    if (!res.ok) setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: task.completed } : t))
  }

  async function deleteTask(task: Task) {
    setTasks(prev => prev.filter(t => t.id !== task.id))
    const res = await apiFetch(`/api/tasks/${task.id}`, { method: 'DELETE' })
    if (!res.ok) setTasks(prev => [...prev, task].sort((a, b) => a.date.localeCompare(b.date)))
  }

  async function addTaskForSelected(e: React.FormEvent) {
    e.preventDefault()
    const title = addTitle.trim()
    if (!title) return
    setAddLoading(true)
    try {
      const res = await apiFetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, date: selectedDate }),
      })
      if (res.ok) {
        handleTaskCreated(await res.json())
        setAddTitle('')
      }
    } finally {
      setAddLoading(false)
    }
  }

  const nowMidnight = new Date()
  nowMidnight.setHours(0, 0, 0, 0)
  const selectedIsToday = selectedDate === todayStr
  const selectedIsPast = selectedDateObj < nowMidnight

  const sectionLabel: React.CSSProperties = {
    fontSize: 10, fontWeight: 500, letterSpacing: '0.12em',
    color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 10,
  }

  // Week header label
  const weekEnd = addDays(weekStart, 6)
  const weekLabel =
    weekStart.getMonth() === weekEnd.getMonth()
      ? `${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getDate()}–${weekEnd.getDate()}`
      : `${MONTH_NAMES[weekStart.getMonth()].slice(0, 3)} ${weekStart.getDate()} – ${MONTH_NAMES[weekEnd.getMonth()].slice(0, 3)} ${weekEnd.getDate()}`

  // ─── Export ───────────────────────────────────────────────────────────────────

  async function exportToExcel() {
    const XLSX = await import('xlsx')

    // Tasks visible in the current period only
    let periodTasks: Task[]
    let sheetTitle: string
    let filename: string

    if (view === 'month') {
      const prefix = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`
      periodTasks = tasks.filter(t => t.date.startsWith(prefix))
      sheetTitle = `${MONTH_NAMES[month.getMonth()]} ${month.getFullYear()}`
      filename = `flou-tasks-${MONTH_NAMES[month.getMonth()]}-${month.getFullYear()}.xlsx`
    } else {
      const weekEndStr = toDateStr(weekEnd)
      const weekStartStr = toDateStr(weekStart)
      periodTasks = tasks.filter(t => t.date >= weekStartStr && t.date <= weekEndStr)
      sheetTitle = weekLabel
      filename = `flou-tasks-week-${weekStartStr}.xlsx`
    }

    periodTasks.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title))

    const headers = ['Date', 'Title', 'Status', 'Hours Spent', 'Completed', 'Description']
    const dataRows = periodTasks.map(t => {
      const d = parseLocalDate(t.date)
      const dateLabel = d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
      const status = statuses.find(s => s.id === t.statusId)
      return [
        dateLabel,
        t.title,
        status?.name ?? '',
        t.hoursSpent ?? '',
        t.completed ? 'Yes' : 'No',
        t.description ?? '',
      ]
    })

    // Summary rows
    const totalHours = periodTasks.reduce((sum, t) => sum + (t.hoursSpent ?? 0), 0)
    const completedCount = periodTasks.filter(t => t.completed).length
    const summaryRows = [
      [],
      ['Summary'],
      ['Period', sheetTitle],
      ['Total tasks', periodTasks.length],
      ['Completed', completedCount],
      ['Pending', periodTasks.length - completedCount],
      ['Total hours', totalHours || ''],
    ]

    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows, ...summaryRows])

    ws['!cols'] = [
      { wch: 26 },
      { wch: 42 },
      { wch: 16 },
      { wch: 13 },
      { wch: 11 },
      { wch: 52 },
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Tasks')
    XLSX.writeFile(wb, filename)
  }

  return (
    <>
      <div className="flex flex-1 overflow-hidden">

        {/* ── Main calendar area ── */}
        <main className="flex flex-1 flex-col overflow-y-auto" style={{ padding: '32px 36px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
                {view === 'month' ? month.getFullYear() : weekStart.getFullYear()}
              </div>
              <h2 className="font-serif" style={{ fontWeight: 400, fontSize: 34, letterSpacing: '-0.5px' }}>
                {view === 'month' ? MONTH_NAMES[month.getMonth()] : weekLabel}
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 4 }}>
              {/* View toggle */}
              <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--divider)' }}>
                {(['month', 'week'] as ViewMode[]).map(v => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    style={{
                      padding: '5px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                      background: view === v ? 'var(--accent)' : 'var(--bg)',
                      color: view === v ? '#fff' : 'var(--text2)',
                      border: 'none',
                    }}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>

              {/* Nav */}
              <button
                onClick={() => {
                  if (view === 'month') setMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))
                  else setWeekStart(w => addDays(w, -7))
                }}
                style={{
                  width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', background: 'var(--bg)', border: '1px solid var(--divider)',
                  color: 'var(--text2)', cursor: 'pointer',
                }}
                aria-label="Previous"
              >
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M13 4l-6 6 6 6" />
                </svg>
              </button>
              <button
                onClick={() => {
                  if (view === 'month') setMonth(startOfMonth(today))
                  else setWeekStart(startOfWeek(today))
                }}
                style={{
                  padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                  background: 'var(--bg)', border: '1px solid var(--divider)',
                  color: 'var(--text2)', cursor: 'pointer',
                }}
              >
                Today
              </button>
              <button
                onClick={() => {
                  if (view === 'month') setMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))
                  else setWeekStart(w => addDays(w, 7))
                }}
                style={{
                  width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', background: 'var(--bg)', border: '1px solid var(--divider)',
                  color: 'var(--text2)', cursor: 'pointer',
                }}
                aria-label="Next"
              >
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M7 4l6 6-6 6" />
                </svg>
              </button>

              {/* Export button */}
              <button
                onClick={exportToExcel}
                disabled={loading || tasks.length === 0}
                style={{
                  height: 32, padding: '0 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                  background: 'var(--bg)', border: '1px solid var(--divider)',
                  color: 'var(--text2)', cursor: tasks.length === 0 ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5,
                  opacity: tasks.length === 0 ? 0.4 : 1,
                }}
                aria-label="Export to Excel"
                title="Export to Excel"
              >
                <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 14v3h12v-3M10 3v10M6 9l4 4 4-4" />
                </svg>
                Export
              </button>
            </div>
          </div>

          {/* ─── Month view ───────────────────────────────────────────────── */}
          {view === 'month' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
                {WEEKDAYS.map(d => (
                  <div key={d} style={{
                    fontSize: 11, fontWeight: 500, color: 'var(--text3)',
                    textAlign: 'center', padding: '4px 0', letterSpacing: '0.05em',
                  }}>
                    {d}
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                {calendarGrid.map((day, idx) => {
                  const ds = toDateStr(day)
                  const isCurrentMonth = day.getMonth() === month.getMonth()
                  const isToday = isSameDay(day, today)
                  const isSelected = ds === selectedDate
                  const dayTasks = tasksByDate.get(ds) ?? []

                  return (
                    <button
                      key={idx}
                      onClick={() => handleDayClick(day)}
                      style={{
                        minHeight: 80, padding: '8px 6px', borderRadius: 10,
                        background: isSelected ? 'var(--bg2)' : 'transparent',
                        border: `1.5px solid ${isToday ? 'var(--accent)' : 'transparent'}`,
                        cursor: 'pointer', opacity: isCurrentMonth ? 1 : 0.3,
                        textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2,
                      }}
                      aria-label={day.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    >
                      <div style={{
                        fontSize: 13, marginBottom: 3,
                        color: isToday ? 'var(--accent)' : 'var(--text)',
                        fontWeight: isToday ? 600 : 400,
                      }}>
                        {day.getDate()}
                      </div>
                      {dayTasks.slice(0, 2).map(t => {
                        const st = statuses.find(s => s.id === t.statusId)
                        return (
                          <div key={t.id} style={{
                            fontSize: 10, lineHeight: 1.3, padding: '1px 5px', borderRadius: 4,
                            background: st ? st.color + '22' : t.completed ? 'var(--bg3)' : 'var(--accent-bg)',
                            color: st ? st.color : t.completed ? 'var(--text3)' : 'var(--accent)',
                            textDecoration: t.completed ? 'line-through' : 'none',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            maxWidth: '100%',
                            display: 'flex', alignItems: 'center', gap: 3,
                          }}>
                            {st && <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.color, flexShrink: 0 }} />}
                            {t.title}
                          </div>
                        )
                      })}
                      {dayTasks.length > 2 && (
                        <div style={{ fontSize: 9, color: 'var(--text3)', paddingLeft: 2 }}>
                          +{dayTasks.length - 2} more
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {/* ─── Week view ────────────────────────────────────────────────── */}
          {view === 'week' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, flex: 1, minHeight: 0 }}>
              {weekDays.map((day, idx) => {
                const ds = toDateStr(day)
                const isToday = isSameDay(day, today)
                const isSelected = ds === selectedDate
                const dayTasks = tasksByDate.get(ds) ?? []

                return (
                  <div
                    key={idx}
                    onClick={() => handleDayClick(day)}
                    style={{
                      display: 'flex', flexDirection: 'column', borderRadius: 12,
                      border: `1.5px solid ${isSelected ? 'var(--accent)' : isToday ? 'var(--accent)' : 'var(--divider)'}`,
                      background: isSelected ? 'var(--bg2)' : 'var(--bg)',
                      cursor: 'pointer', overflow: 'hidden', minHeight: 320,
                    }}
                  >
                    {/* Day header */}
                    <div style={{
                      padding: '12px 10px 10px',
                      borderBottom: '1px solid var(--divider)',
                      background: isToday ? 'var(--accent)' : 'transparent',
                      flexShrink: 0,
                    }}>
                      <div style={{
                        fontSize: 10, fontWeight: 500, letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: isToday ? 'rgba(255,255,255,0.75)' : 'var(--text3)',
                      }}>
                        {WEEKDAYS[idx]}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <div style={{
                          fontSize: 20, fontWeight: isToday ? 600 : 400,
                          color: isToday ? '#fff' : 'var(--text)',
                          fontFamily: 'var(--font-serif)',
                        }}>
                          {day.getDate()}
                        </div>
                        {(() => {
                          const totalHours = dayTasks.reduce((s, t) => s + (t.hoursSpent ?? 0), 0)
                          return totalHours > 0 ? (
                            <span style={{
                              fontSize: 10, fontWeight: 600,
                              color: isToday ? 'rgba(255,255,255,0.85)' : 'var(--accent)',
                            }}>
                              {totalHours % 1 === 0 ? totalHours : totalHours.toFixed(1)}h
                            </span>
                          ) : null
                        })()}
                      </div>
                    </div>

                    {/* Task list */}
                    <div style={{ flex: 1, padding: '6px', display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto' }}>
                      {loading ? (
                        <div style={{ fontSize: 11, color: 'var(--text3)', padding: 4 }}>…</div>
                      ) : dayTasks.length === 0 ? (
                        <div style={{ fontSize: 11, color: 'var(--text3)', padding: 4, fontStyle: 'italic' }}>—</div>
                      ) : (
                        dayTasks.map(t => (
                          <div
                            key={t.id}
                            style={{
                              display: 'flex', alignItems: 'flex-start', gap: 5,
                              padding: '5px 6px', borderRadius: 6,
                              background: t.completed ? 'var(--bg3)' : 'var(--bg2)',
                            }}
                          >
                            <button
                              onClick={e => { e.stopPropagation(); toggleTask(t) }}
                              style={{
                                flexShrink: 0, width: 6, height: 6, marginTop: 4, borderRadius: '50%',
                                background: t.completed ? 'var(--text3)' : 'var(--accent)',
                                padding: 0, border: 'none', cursor: 'pointer',
                              }}
                              aria-label={t.completed ? 'Mark incomplete' : 'Mark complete'}
                            />
                            <button
                              onClick={e => { e.stopPropagation(); setDetailTask(t) }}
                              style={{
                                flex: 1, textAlign: 'left', background: 'none', border: 'none',
                                padding: 0, cursor: 'pointer',
                              }}
                            >
                              <span style={{
                                fontSize: 11, lineHeight: 1.4, display: 'block',
                                textDecoration: t.completed ? 'line-through' : 'none',
                                color: t.completed ? 'var(--text3)' : 'var(--text)',
                                wordBreak: 'break-word',
                              }}>
                                {t.title}
                              </span>
                              {(() => {
                                const st = statuses.find(s => s.id === t.statusId)
                                return (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                                    {st && (
                                      <span style={{
                                        fontSize: 8, fontWeight: 600, padding: '0px 4px', borderRadius: 3,
                                        background: st.color + '22', color: st.color,
                                      }}>
                                        {st.name}
                                      </span>
                                    )}
                                    {t.hoursSpent != null && (
                                      <span style={{ fontSize: 9, color: 'var(--text3)' }}>
                                        {t.hoursSpent % 1 === 0 ? t.hoursSpent : t.hoursSpent.toFixed(1)}h
                                      </span>
                                    )}
                                  </div>
                                )
                              })()}
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Quick add footer */}
                    <div
                      onClick={e => { e.stopPropagation(); handleDayClick(day) }}
                      style={{
                        borderTop: '1px solid var(--divider)', padding: '6px 8px', flexShrink: 0,
                        display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text3)',
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 20 20" fill="none" stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                        <path d="M10 4v12M4 10h12" />
                      </svg>
                      <span style={{ fontSize: 10 }}>Add task</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>

        {/* ── Right panel (desktop only) ── */}
        <div
          ref={rightPanelRef}
          className="hidden lg:flex"
          style={{
            width: 240, borderLeft: '1px solid var(--divider)',
            padding: '32px 22px', overflow: 'auto',
            background: 'var(--bg2)', flexDirection: 'column', gap: 24,
          }}
        >
          {/* Selected date heading */}
          <div>
            <div style={sectionLabel}>
              {selectedIsToday ? 'Today' : selectedIsPast ? 'What you did' : "What's planned"}
            </div>
            <div className="font-serif" style={{ fontSize: 28, fontWeight: 400 }}>
              {selectedDayNum}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
              {selectedMonthName} {selectedYear}
            </div>
          </div>

          {/* Add task — always available */}
          <form onSubmit={addTaskForSelected}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 10px', borderRadius: 8,
              border: '1.5px solid var(--divider)', background: 'var(--bg)',
            }}>
              <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" style={{ color: 'var(--accent)', flexShrink: 0 }}>
                <path d="M10 4v12M4 10h12" />
              </svg>
              <input
                ref={addInputRef}
                value={addTitle}
                onChange={e => setAddTitle(e.target.value)}
                placeholder="Add task…"
                style={{
                  flex: 1, fontSize: 12, background: 'transparent',
                  border: 'none', outline: 'none', color: 'var(--text)',
                }}
              />
              {addTitle.trim() && (
                <button
                  type="submit"
                  disabled={addLoading}
                  style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 6,
                    background: 'var(--accent)', color: '#fff', fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  {addLoading ? '…' : 'Add'}
                </button>
              )}
            </div>
          </form>

          {/* Task list for selected day */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={sectionLabel}>Tasks</div>
              {(() => {
                const totalHours = selectedTasks.reduce((sum, t) => sum + (t.hoursSpent ?? 0), 0)
                return totalHours > 0 ? (
                  <div style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 6,
                    background: 'var(--accent-bg)', color: 'var(--accent)',
                  }}>
                    {totalHours % 1 === 0 ? totalHours : totalHours.toFixed(1)}h total
                  </div>
                ) : null
              })()}
            </div>
            {loading ? (
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Loading…</div>
            ) : selectedTasks.length > 0 ? (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {selectedTasks.map(task => (
                  <li
                    key={task.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 8px', borderRadius: 8, cursor: 'default',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <CheckCircle completed={task.completed} onToggle={() => toggleTask(task)} />
                    <button
                      onClick={() => setDetailTask(task)}
                      style={{
                        flex: 1, textAlign: 'left', background: 'none', border: 'none',
                        cursor: 'pointer', padding: 0,
                      }}
                    >
                      <span style={{
                        fontSize: 13, lineHeight: 1.4, display: 'block',
                        textDecoration: task.completed ? 'line-through' : 'none',
                        color: task.completed ? 'var(--text3)' : selectedIsPast && !task.completed ? '#b45309' : 'var(--text)',
                      }}>
                        {task.title}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
                        {(() => {
                          const st = statuses.find(s => s.id === task.statusId)
                          return st ? (
                            <span style={{
                              fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 4,
                              background: st.color + '22', color: st.color,
                              display: 'flex', alignItems: 'center', gap: 3,
                            }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.color }} />
                              {st.name}
                            </span>
                          ) : null
                        })()}
                        {task.hoursSpent != null && (
                          <span style={{ fontSize: 10, color: 'var(--text3)' }}>
                            {task.hoursSpent % 1 === 0 ? task.hoursSpent : task.hoursSpent.toFixed(1)}h
                          </span>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={() => setDetailTask(task)}
                      style={{ padding: 4, borderRadius: 6, color: 'var(--text3)', cursor: 'pointer', flexShrink: 0 }}
                      aria-label="Edit task"
                    >
                      <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="font-serif" style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>
                {selectedIsPast ? 'Nothing was scheduled.' : 'Nothing here — room to breathe.'}
              </div>
            )}
          </div>

          {/* Up next */}
          <div>
            <div style={sectionLabel}>Up next</div>
            {upNext.length === 0 ? (
              <div className="font-serif" style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>
                Nothing coming up.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {upNext.map(({ date, task }) => (
                  <div key={task.id}>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                      {parseLocalDate(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{ fontSize: 13 }}>{task.title}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile day dialog */}
      <DayDetailDialog
        open={dialogOpen}
        date={dialogDate}
        tasks={tasksByDate.get(dialogDate) ?? []}
        onClose={() => setDialogOpen(false)}
        onToggle={toggleTask}
        onDelete={deleteTask}
        onTaskCreated={handleTaskCreated}
        onOpenTask={setDetailTask}
      />

      {/* Task detail dialog */}
      <TaskDetailDialog
        task={detailTask}
        statuses={statuses}
        onClose={() => setDetailTask(null)}
        onUpdated={handleTaskUpdated}
        onDeleted={handleTaskDeleted}
        onStatusesChange={setStatuses}
      />

    </>
  )
}
