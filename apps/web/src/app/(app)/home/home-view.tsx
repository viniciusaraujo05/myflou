'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { User, Task } from '@flou/shared'
import { apiFetch } from '@/lib/auth'

// ─── Types ───────────────────────────────────────────────────────────────────

interface CaptureItem {
  id: number
  type: 'note' | 'link'
  content: string
  title?: string
  at: Date
}

interface Habit {
  label: string
  emoji: string
  streak: number
}

const HABITS: Habit[] = [
  { label: 'Read',  emoji: '📖', streak: 4 },
  { label: 'Move',  emoji: '🏃', streak: 7 },
  { label: 'Write', emoji: '✍️', streak: 2 },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ─── Subcomponents ───────────────────────────────────────────────────────────

function CheckBox({ done, onToggle }: { done: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex shrink-0 items-center justify-center rounded-[5px] transition-all"
      style={{
        width: 17, height: 17,
        border: `1.5px solid ${done ? 'var(--accent)' : 'var(--bg3)'}`,
        background: done ? 'var(--accent)' : 'transparent',
      }}
      aria-label={done ? 'Mark incomplete' : 'Mark complete'}
    >
      {done && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M1.5 5.5l2.5 2.5 4.5-5" />
        </svg>
      )}
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface HomeViewProps {
  user: User
  initialTasks: Task[]
}

export function HomeView({ user, initialTasks }: HomeViewProps) {
  const displayName = user.email.split('@')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const greetIcon = hour < 18 ? (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text3)' }}>
      <circle cx="10" cy="10" r="4" />
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text3)' }}>
      <path d="M17 12.5A7 7 0 1 1 7.5 3 5.5 5.5 0 0 0 17 12.5z" />
    </svg>
  )

  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const monthName = new Date().toLocaleDateString('en-US', { month: 'short' })
  const dayNum = new Date().getDate()

  // Tasks
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const complete = tasks.filter(t => t.completed).length

  async function toggleTask(task: Task) {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))
    const res = await apiFetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed }),
    })
    if (!res.ok) setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: task.completed } : t))
  }

  // Focus
  const [focus, setFocus] = useState('')
  const [focusEdit, setFocusEdit] = useState(false)
  const [focusVal, setFocusVal] = useState('')

  // Habits
  const [doneHabits, setDoneHabits] = useState<string[]>([])
  const toggleHabit = (label: string) =>
    setDoneHabits(d => d.includes(label) ? d.filter(x => x !== label) : [...d, label])

  // Capture bar
  const [captureVal, setCaptureVal] = useState('')
  const [captureLoading, setCaptureLoading] = useState(false)
  const [captureResult, setCaptureResult] = useState<{ type: string; title: string }[] | null>(null)
  const [items, setItems] = useState<CaptureItem[]>([])
  let nextId = 0

  async function submitCapture() {
    const trimmed = captureVal.trim()
    if (!trimmed) return
    setCaptureLoading(true)
    setCaptureResult(null)
    try {
      const res = await apiFetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      })
      if (res.ok) {
        const data = await res.json() as { created: { type: string; title: string; url?: string; date?: string }[] }
        setCaptureResult(data.created)
        // Show items locally too
        data.created.forEach(item => {
          setItems(prev => [{
            id: ++nextId,
            type: item.type === 'link' ? 'link' : 'note',
            content: item.url ?? item.title,
            title: item.type === 'link' ? (() => { try { return new URL(item.url ?? '').hostname } catch { return item.title } })() : undefined,
            at: new Date(),
          }, ...prev])
        })
        setCaptureVal('')
        setTimeout(() => setCaptureResult(null), 4000)
      }
    } finally {
      setCaptureLoading(false)
    }
  }

  const notes = items.filter(i => i.type === 'note')
  const links = items.filter(i => i.type === 'link')

  const sectionLabel = {
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: '0.12em',
    color: 'var(--text3)',
    textTransform: 'uppercase' as const,
    marginBottom: 10,
  }

  const card = {
    background: 'var(--bg)',
    borderRadius: 14,
    padding: '20px',
    boxShadow: 'var(--shadow)',
    border: '1px solid var(--divider)',
  }

  return (
    <main
      className="fade-in flex flex-1 flex-col overflow-y-auto"
      style={{ padding: '32px 36px' }}
    >
      {/* ── Header ── */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            {greetIcon}
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>{dayName}, {monthName} {dayNum}</span>
          </div>
          <h1 className="font-serif" style={{ fontWeight: 400, fontSize: 28, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
            {greeting}, <em>{displayName}.</em>
          </h1>
        </div>
      </div>

      {/* ── Capture bar ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          background: 'var(--bg)', border: `1.5px solid ${captureLoading ? 'var(--accent)' : 'var(--divider)'}`,
          borderRadius: 12, display: 'flex', alignItems: 'center',
          gap: 8, padding: '10px 14px', boxShadow: 'var(--shadow)',
          transition: 'border-color 0.15s',
        }}>
          {/* Sparkle icon */}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <path d="M12 2l2.09 6.26L20 9.27l-4.91 3.56 1.82 6.17L12 15.6l-4.91 3.4 1.82-6.17L4 9.27l5.91-1.01z"
              fill="var(--accent)" opacity="0.8" />
          </svg>
          <input
            value={captureVal}
            onChange={e => { setCaptureVal(e.target.value); setCaptureResult(null) }}
            onKeyDown={e => e.key === 'Enter' && submitCapture()}
            placeholder="Capture a thought, paste a link…"
            disabled={captureLoading}
            style={{ flex: 1, fontSize: 13.5, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)' }}
          />
          <div style={{ display: 'flex', gap: 4, borderLeft: '1px solid var(--divider)', paddingLeft: 8 }}>
            <button
              onClick={submitCapture}
              disabled={!captureVal.trim() || captureLoading}
              style={{
                padding: '3px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                background: 'var(--accent)', color: '#fff', fontWeight: 500,
                opacity: captureVal.trim() && !captureLoading ? 1 : 0.4,
                display: 'flex', alignItems: 'center', gap: 5, border: 'none',
              }}
            >
              {captureLoading ? '…' : '✦ AI'}
            </button>
          </div>
        </div>

        {/* Result feedback */}
        {captureResult !== null && (
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {captureResult.length === 0 ? (
              <span style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>No items identified</span>
            ) : captureResult.map((item, i) => (
              <span key={i} style={{
                fontSize: 11, padding: '2px 9px', borderRadius: 20, fontWeight: 500,
                background: 'var(--accent-bg)', color: 'var(--accent)',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                {item.type === 'note' ? '📝' : item.type === 'task' ? '✅' : item.type === 'credential' ? '🔐' : '🔗'} {item.title}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Today's focus ── */}
      <div style={{ ...card, background: 'var(--sand)', marginBottom: 20 }}>
        <div style={sectionLabel}>Today&apos;s focus</div>
        {focusEdit ? (
          <input
            autoFocus
            value={focusVal}
            onChange={e => setFocusVal(e.target.value)}
            onBlur={() => { setFocus(focusVal); setFocusEdit(false) }}
            onKeyDown={e => { if (e.key === 'Enter') { setFocus(focusVal); setFocusEdit(false) } }}
            placeholder="What matters most today?"
            className="font-serif"
            style={{ fontStyle: 'italic', fontSize: 17, color: 'var(--text)', width: '100%', background: 'transparent', border: 'none', outline: 'none' }}
          />
        ) : (
          <div
            onClick={() => { setFocusVal(focus); setFocusEdit(true) }}
            className="font-serif"
            style={{ fontStyle: 'italic', fontSize: 17, color: focus ? 'var(--text)' : 'var(--text3)', cursor: 'text' }}
          >
            {focus || 'Set an intention for today…'}
          </div>
        )}
      </div>

      {/* ── 3-column grid: Tasks / Habits / Calendar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>

        {/* Tasks */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={sectionLabel}>Tasks</div>
            <Link href="/calendar" style={{ color: 'var(--accent)', fontSize: 11 }}>+ add</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tasks.length === 0 && (
              <p style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }} className="font-serif">
                Nothing for today yet.
              </p>
            )}
            {tasks.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                onClick={() => toggleTask(t)}>
                <CheckBox done={t.completed} onToggle={() => toggleTask(t)} />
                <span style={{
                  fontSize: 13, lineHeight: 1.4,
                  textDecoration: t.completed ? 'line-through' : 'none',
                  color: t.completed ? 'var(--text3)' : 'var(--text)',
                }}>
                  {t.title}
                </span>
              </div>
            ))}
          </div>
          {tasks.length > 0 && (
            <div style={{ marginTop: 14, fontSize: 11, color: 'var(--text3)' }}>
              {complete}/{tasks.length} done
            </div>
          )}
        </div>

        {/* Habits */}
        <div style={card}>
          <div style={sectionLabel}>Habits</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {HABITS.map(h => (
              <div key={h.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={() => toggleHabit(h.label)}
                  style={{
                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                    background: doneHabits.includes(h.label) ? 'var(--accent-bg)' : 'var(--bg2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, cursor: 'pointer',
                    border: `1.5px solid ${doneHabits.includes(h.label) ? 'var(--accent)' : 'transparent'}`,
                  }}
                >
                  {h.emoji}
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13 }}>{h.label}</div>
                  <div style={{ display: 'flex', gap: 3, marginTop: 3 }}>
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} style={{
                        width: 5, height: 5, borderRadius: 2,
                        background: i < h.streak ? 'var(--accent)' : 'var(--bg3)',
                        opacity: i < h.streak ? 0.7 + i * 0.04 : 1,
                      }} />
                    ))}
                  </div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>{h.streak}d</span>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar widget */}
        <Link href="/calendar" style={{ ...card, textDecoration: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={sectionLabel}>Calendar</div>
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text3)' }}>
              <path d="M7 4l6 6-6 6" />
            </svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
            <span className="font-serif" style={{ fontSize: 40, fontWeight: 400, lineHeight: 1, color: 'var(--text)' }}>
              {dayNum}
            </span>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>{monthName} {new Date().getFullYear()}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{dayName}</div>
            </div>
          </div>
          <div className="font-serif" style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>
            {tasks.length === 0
              ? <>Nothing scheduled —<br />a quiet day.</>
              : complete === tasks.length
                ? 'All done today!'
                : `${complete}/${tasks.length} tasks complete`}
          </div>
        </Link>
      </div>

      {/* ── 2-column grid: Notes / Links ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* Recent Notes */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={sectionLabel}>Recent Notes</div>
            <Link href="/notes" style={{ color: 'var(--accent)', fontSize: 11 }}>see all</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {notes.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }} className="font-serif">
                Capture a thought above.
              </p>
            ) : (
              notes.slice(0, 3).map(n => (
                <div key={n.id} style={{
                  padding: '11px 13px', background: 'var(--lavender)',
                  borderRadius: 9, fontSize: 12.5, lineHeight: 1.55, color: 'var(--text)',
                }}>
                  {n.content.length > 90 ? n.content.slice(0, 90) + '…' : n.content}
                  <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>{timeAgo(n.at)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Saved Links */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={sectionLabel}>Saved Links</div>
            <Link href="/links" style={{ color: 'var(--accent)', fontSize: 11 }}>see all</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {links.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }} className="font-serif">
                Paste a URL in the capture bar.
              </p>
            ) : (
              links.slice(0, 4).map(l => {
                let domain = ''
                try { domain = new URL(l.content).hostname } catch { /* ignore */ }
                return (
                  <a key={l.id} href={l.content} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', background: 'var(--rose)', borderRadius: 9, textDecoration: 'none',
                    }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 5, background: 'rgba(255,255,255,0.5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, fontSize: 10, fontWeight: 600, color: 'var(--text2)',
                    }}>
                      {domain.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }}>
                        {l.title || domain}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {domain}
                      </div>
                    </div>
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text3)', flexShrink: 0 }}>
                      <path d="M17 3l-7 7M17 3H11M17 3v6M9 5H5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-4" />
                    </svg>
                  </a>
                )
              })
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
