'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import type { Credential, Link as SavedLink, NoteSummary, Task, User } from '@flou/shared'
import { apiFetch } from '@/lib/auth'

interface HomeViewProps {
  user: User
  initialTasks: Task[]
  initialNotes: NoteSummary[]
  initialLinks: SavedLink[]
  initialCredentials: Credential[]
}

interface CaptureCreated {
  type: 'note' | 'task' | 'link' | 'credential'
  id: string
  title: string
  date?: string
  url?: string
}

type CapturePreviewItem =
  | { type: 'note'; title: string; content: string; folderId: string | null }
  | { type: 'task'; title: string; date: string; description: string | null }
  | { type: 'link'; url: string; title: string; description: string | null; categoryId: string | null; username: string | null; password: string | null }
  | { type: 'credential'; service: string; username: string; password: string; url: string | null; notes: string | null }

const PREVIEW_LABELS: Record<CapturePreviewItem['type'], string> = {
  note: 'Note',
  task: 'Task',
  link: 'Link',
  credential: 'Password',
}

const widgetBase: CSSProperties = {
  border: '1px solid var(--divider)',
  borderRadius: 18,
  boxShadow: 'var(--shadow)',
  textDecoration: 'none',
  color: 'var(--text)',
}

const labelStyle: CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--text3)',
}

function todayString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatToday() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

function CheckBox({ done, onToggle }: { done: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex shrink-0 items-center justify-center transition-all"
      style={{
        width: 18,
        height: 18,
        borderRadius: 6,
        border: `1.5px solid ${done ? 'var(--accent)' : 'var(--bg3)'}`,
        background: done ? 'var(--accent)' : 'rgba(255,255,255,0.35)',
      }}
      aria-label={done ? 'Mark incomplete' : 'Mark complete'}
    >
      {done && (
        <svg width="11" height="11" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M1.5 5.5l2.5 2.5 4.5-5" />
        </svg>
      )}
    </button>
  )
}

function MiniIcon({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center"
      style={{
        width: 34,
        height: 34,
        borderRadius: 11,
        background: color,
        color: 'var(--text)',
      }}
    >
      {children}
    </span>
  )
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4l6 6-6 6" />
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l2.3 6.8L21 11l-6.7 2.2L12 20l-2.3-6.8L3 11l6.7-2.2L12 2z" fill="currentColor" />
    </svg>
  )
}

function WidgetLink({
  href,
  title,
  value,
  detail,
  color,
  icon,
}: {
  href: string
  title: string
  value: string
  detail: string
  color: string
  icon: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[132px] flex-col justify-between p-4 transition-transform hover:-translate-y-0.5"
      style={{ ...widgetBase, background: 'var(--bg)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <MiniIcon color={color}>{icon}</MiniIcon>
        <span className="mt-1 text-[var(--text3)] transition-colors group-hover:text-[var(--text2)]">
          <ArrowIcon />
        </span>
      </div>
      <div>
        <div style={labelStyle}>{title}</div>
        <div className="mt-1 font-serif text-[30px] leading-none">{value}</div>
        <p className="mt-2 text-[12px] leading-5 text-[var(--text2)]">{detail}</p>
      </div>
    </Link>
  )
}

export function HomeView({
  user,
  initialTasks,
  initialNotes,
  initialLinks,
  initialCredentials,
}: HomeViewProps) {
  const displayName = user.email.split('@')[0]
  const today = todayString()
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [notes, setNotes] = useState<NoteSummary[]>(initialNotes)
  const [links, setLinks] = useState<SavedLink[]>(initialLinks)
  const [credentials, setCredentials] = useState<Credential[]>(initialCredentials)
  const [captureVal, setCaptureVal] = useState('')
  const [captureLoading, setCaptureLoading] = useState(false)
  const [captureSaving, setCaptureSaving] = useState(false)
  const [capturePreview, setCapturePreview] = useState<CapturePreviewItem[] | null>(null)
  const [captureResult, setCaptureResult] = useState<CaptureCreated[] | null>(null)
  const [captureError, setCaptureError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const completed = tasks.filter(t => t.completed).length
  const nextTasks = tasks.slice(0, 5)
  const emptyWorkspace = tasks.length + notes.length + links.length + credentials.length === 0

  const guidance = useMemo(() => {
    if (emptyWorkspace) {
      return 'Start by telling the AI what you want to save: tasks, notes, links or passwords.'
    }
    if (tasks.length === 0) return 'Add today tasks from the capture box or open the calendar.'
    if (completed === tasks.length) return 'Today is clear. Capture anything new before it gets lost.'
    return `${tasks.length - completed} task${tasks.length - completed === 1 ? '' : 's'} still open today.`
  }, [completed, emptyWorkspace, tasks.length])

  async function toggleTask(task: Task) {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))
    const res = await apiFetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed }),
    })
    if (!res.ok) {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: task.completed } : t))
    }
  }

  async function submitCapture() {
    const trimmed = captureVal.trim()
    if (!trimmed) return

    setCaptureLoading(true)
    setCaptureResult(null)
    setCapturePreview(null)
    setCaptureError('')

    try {
      const res = await apiFetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setCaptureError((data as { message?: string }).message || 'Could not analyze this capture.')
        return
      }

      const items = (data as { items?: CapturePreviewItem[] }).items ?? []
      setCapturePreview(items)
      if (items.length === 0) setCaptureResult([])
    } catch {
      setCaptureError('Something went wrong while analyzing.')
    } finally {
      setCaptureLoading(false)
    }
  }

  async function savePreview() {
    if (!capturePreview?.length) return
    setCaptureSaving(true)
    setCaptureError('')

    try {
      const res = await apiFetch('/api/ai/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: capturePreview }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setCaptureError((data as { message?: string }).message || 'Could not save the selected items.')
        return
      }

      const created = (data as { created?: CaptureCreated[] }).created ?? []
      setCaptureResult(created)
      setCapturePreview(null)
      setCaptureVal('')
      await applyCreatedItems(created)
    } catch {
      setCaptureError('Something went wrong while saving.')
    } finally {
      setCaptureSaving(false)
    }
  }

  async function applyCreatedItems(created: CaptureCreated[]) {
    for (const item of created) {
      if (item.type === 'task' && item.date === today) {
        const taskRes = await apiFetch(`/api/tasks?from=${today}&to=${today}`)
        if (taskRes.ok) setTasks(await taskRes.json())
      }
      if (item.type === 'note') {
        setNotes(prev => [{
          id: item.id,
          userId: user.id,
          spaceId: null,
          folderId: null,
          title: item.title,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }, ...prev])
      }
      if (item.type === 'link') {
        setLinks(prev => [{
          id: item.id,
          userId: user.id,
          spaceId: null,
          categoryId: null,
          title: item.title,
          url: item.url ?? '',
          description: null,
          username: null,
          password: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }, ...prev])
      }
      if (item.type === 'credential') {
        setCredentials(prev => [{
          id: item.id,
          userId: user.id,
          spaceId: null,
          service: item.title,
          username: '',
          password: '',
          url: item.url ?? null,
          notes: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }, ...prev])
      }
    }
  }

  function previewTitle(item: CapturePreviewItem) {
    return item.type === 'credential' ? item.service : item.title
  }

  function previewDetail(item: CapturePreviewItem) {
    if (item.type === 'task') return item.date
    if (item.type === 'link') return item.url
    if (item.type === 'credential') return [item.username, item.url].filter(Boolean).join(' · ') || 'credential'
    return item.content || 'note'
  }

  return (
    <main className="fade-in flex flex-1 flex-col overflow-y-auto" style={{ padding: '28px clamp(18px, 4vw, 38px)' }}>
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5">
        <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <div
            className="min-h-[260px] p-5 sm:p-6"
            style={{
              ...widgetBase,
              background: 'var(--bg)',
            }}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[12px] text-[var(--text3)]">{formatToday()}</p>
                <h1 className="mt-1 font-serif text-[30px] leading-tight sm:text-[36px]">
                  Welcome, <em>{displayName}</em>
                </h1>
                <p className="mt-2 max-w-[560px] text-[13px] leading-6 text-[var(--text2)]">{guidance}</p>
              </div>
              <button
                onClick={() => textareaRef.current?.focus()}
                className="hidden shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-semibold text-white sm:flex"
                style={{ background: 'var(--accent)' }}
              >
                <SparkleIcon />
                Capture
              </button>
            </div>

            <div
              style={{
                border: `1.5px solid ${captureLoading ? 'var(--accent)' : 'var(--divider)'}`,
                borderRadius: 16,
                background: 'rgba(255,255,255,0.48)',
                boxShadow: '0 10px 30px rgba(28,24,20,0.06)',
              }}
            >
              <textarea
                ref={textareaRef}
                value={captureVal}
                onChange={e => {
                  setCaptureVal(e.target.value)
                  setCapturePreview(null)
                  setCaptureResult(null)
                  setCaptureError('')
                }}
                onKeyDown={e => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault()
                    submitCapture()
                  }
                }}
                placeholder={'Tell the AI what to register...\nExample: "Tomorrow call dentist at 10, save https://railway.app as Deploy, and store Gmail user maria@email.com password 1234"'}
                rows={5}
                disabled={captureLoading || captureSaving}
                className="block w-full resize-none bg-transparent px-4 py-4 text-[14px] leading-6 outline-none"
                style={{ color: 'var(--text)' }}
              />
              <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                style={{ borderColor: 'var(--divider)' }}>
                <div className="flex flex-wrap gap-2">
                  {['task', 'note', 'link', 'password'].map(item => (
                    <span key={item} className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                      style={{ background: 'rgba(255,255,255,0.55)', color: 'var(--text2)' }}>
                      {item}
                    </span>
                  ))}
                </div>
                <button
                  onClick={submitCapture}
                  disabled={!captureVal.trim() || captureLoading || captureSaving}
                  className="flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold text-white transition-opacity"
                  style={{
                    background: 'var(--accent)',
                    opacity: captureVal.trim() && !captureLoading && !captureSaving ? 1 : 0.45,
                    cursor: captureVal.trim() && !captureLoading && !captureSaving ? 'pointer' : 'not-allowed',
                  }}
                >
                  <SparkleIcon />
                  {captureLoading ? 'Analyzing...' : 'Review with AI'}
                </button>
              </div>
            </div>

            {captureError && (
              <p className="mt-3 rounded-xl px-3 py-2 text-[12px]" style={{ background: '#fef2f2', color: '#dc2626' }}>
                {captureError}
              </p>
            )}

            {capturePreview && capturePreview.length > 0 && (
              <div className="mt-4 rounded-2xl border p-3" style={{ borderColor: 'var(--divider)', background: 'var(--bg2)' }}>
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div style={labelStyle}>Review before saving</div>
                    <p className="mt-1 text-[12px] text-[var(--text2)]">Remove anything wrong. Nothing is saved until you confirm.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCapturePreview(null)}
                      disabled={captureSaving}
                      className="rounded-xl px-3 py-2 text-[12px] font-semibold"
                      style={{ background: 'var(--bg)', color: 'var(--text2)', border: '1px solid var(--divider)' }}
                    >
                      Reject all
                    </button>
                    <button
                      onClick={savePreview}
                      disabled={captureSaving}
                      className="rounded-xl px-3 py-2 text-[12px] font-semibold text-white"
                      style={{ background: 'var(--accent)', opacity: captureSaving ? 0.55 : 1 }}
                    >
                      {captureSaving ? 'Saving...' : `Save ${capturePreview.length}`}
                    </button>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {capturePreview.map((item, index) => (
                    <div
                      key={`${item.type}-${index}`}
                      className="flex min-w-0 items-start gap-3 rounded-xl border p-3"
                      style={{ borderColor: 'var(--divider)', background: 'var(--bg)' }}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text3)]">
                          {PREVIEW_LABELS[item.type]}
                        </div>
                        <p className="truncate text-[13px] font-semibold text-[var(--text)]">{previewTitle(item)}</p>
                        <p className="mt-1 line-clamp-2 break-words text-[12px] leading-5 text-[var(--text2)]">{previewDetail(item)}</p>
                      </div>
                      <button
                        onClick={() => setCapturePreview(prev => prev ? prev.filter((_, i) => i !== index) : prev)}
                        disabled={captureSaving}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--text3)]"
                        style={{ background: 'var(--bg2)', border: '1px solid var(--divider)' }}
                        aria-label="Reject item"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {captureResult && (
              <div className="mt-3 flex flex-wrap gap-2">
                {captureResult.length === 0 ? (
                  <span className="text-[12px] italic text-[var(--text3)]">Nothing was identified. Try adding more context.</span>
                ) : captureResult.map(item => (
                  <Link
                    key={`${item.type}-${item.id}`}
                    href={item.type === 'task' ? '/calendar' : item.type === 'note' ? '/notes' : item.type === 'link' ? '/links' : '/passwords'}
                    className="rounded-full px-3 py-1.5 text-[12px] font-medium"
                    style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
                  >
                    {item.type}: {item.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <WidgetLink
              href="/calendar"
              title="Today"
              value={`${completed}/${tasks.length}`}
              detail={tasks.length ? 'tasks complete' : 'no tasks yet'}
              color="var(--accent-bg)"
              icon={<svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 10l4 4 8-8" /></svg>}
            />
            <WidgetLink
              href="/notes"
              title="Notes"
              value={String(notes.length)}
              detail="saved ideas and docs"
              color="var(--lavender)"
              icon={<svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h12v9l-4 4H4z" /><path d="M12 13v4l4-4" /></svg>}
            />
            <WidgetLink
              href="/links"
              title="Links"
              value={String(links.length)}
              detail="bookmarks organized"
              color="var(--rose)"
              icon={<svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 12a4 4 0 006 0l2-2a4 4 0 00-6-6l-1 1" /><path d="M12 8a4 4 0 00-6 0L4 10a4 4 0 006 6l1-1" /></svg>}
            />
            <WidgetLink
              href="/passwords"
              title="Passwords"
              value={String(credentials.length)}
              detail="credentials stored"
              color="var(--sand)"
              icon={<svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="9" width="14" height="9" rx="2" /><path d="M7 9V6a3 3 0 016 0v3" /></svg>}
            />
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
          <div className="p-4 sm:p-5" style={{ ...widgetBase, background: 'var(--bg)' }}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div style={labelStyle}>Today tasks</div>
                <p className="mt-1 text-[13px] text-[var(--text2)]">Check off what is done or open the calendar for details.</p>
              </div>
              <Link href="/calendar" className="rounded-xl px-3 py-2 text-[12px] font-semibold"
                style={{ background: 'var(--bg2)', color: 'var(--text2)' }}>
                Open calendar
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              {nextTasks.length === 0 ? (
                <div className="rounded-2xl p-4" style={{ background: 'var(--bg2)' }}>
                  <p className="font-serif text-[17px] italic text-[var(--text)]">Your day is empty.</p>
                  <p className="mt-1 text-[12px] leading-5 text-[var(--text2)]">
                    Write something like "today finish proposal" in the AI capture box and it will become a task.
                  </p>
                </div>
              ) : nextTasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded-2xl px-3 py-3"
                  style={{ background: task.completed ? 'var(--bg2)' : 'rgba(255,255,255,0.45)' }}
                >
                  <CheckBox done={task.completed} onToggle={() => toggleTask(task)} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium"
                      style={{
                        color: task.completed ? 'var(--text3)' : 'var(--text)',
                        textDecoration: task.completed ? 'line-through' : 'none',
                      }}>
                      {task.title}
                    </p>
                    {task.description && <p className="truncate text-[11px] text-[var(--text3)]">{task.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            <div className="p-4" style={{ ...widgetBase, background: 'var(--bg)' }}>
              <div className="mb-3 flex items-center justify-between">
                <div style={labelStyle}>Recent notes</div>
                <Link href="/notes" className="text-[12px] font-medium text-[var(--accent)]">See all</Link>
              </div>
              <div className="flex flex-col gap-2">
                {notes.slice(0, 3).map(note => (
                  <Link key={note.id} href="/notes" className="rounded-xl px-3 py-2 text-[13px] font-medium"
                    style={{ background: 'var(--lavender)', color: 'var(--text)' }}>
                    <span className="block truncate">{note.title || 'Untitled'}</span>
                  </Link>
                ))}
                {notes.length === 0 && <p className="text-[12px] italic text-[var(--text3)]">No notes yet.</p>}
              </div>
            </div>

            <div className="p-4" style={{ ...widgetBase, background: 'var(--bg)' }}>
              <div className="mb-3 flex items-center justify-between">
                <div style={labelStyle}>Quick actions</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/calendar" className="rounded-xl px-3 py-3 text-[12px] font-semibold" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                  New task
                </Link>
                <Link href="/notes" className="rounded-xl px-3 py-3 text-[12px] font-semibold" style={{ background: 'var(--lavender)', color: 'var(--text)' }}>
                  New note
                </Link>
                <Link href="/links" className="rounded-xl px-3 py-3 text-[12px] font-semibold" style={{ background: 'var(--rose)', color: 'var(--text)' }}>
                  Save link
                </Link>
                <Link href="/passwords" className="rounded-xl px-3 py-3 text-[12px] font-semibold" style={{ background: 'var(--sand)', color: 'var(--text)' }}>
                  Add password
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
