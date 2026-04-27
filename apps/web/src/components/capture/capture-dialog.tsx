'use client'

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { apiFetch } from '@/lib/auth'

interface SavedItem {
  type: 'note' | 'task' | 'link' | 'credential'
  id: string
  title: string
  date?: string
  url?: string
}

interface CaptureResult {
  created: SavedItem[]
}

interface CaptureDialogProps {
  open: boolean
  onClose: () => void
}

const TYPE_ICONS: Record<SavedItem['type'], string> = {
  note: '📝',
  task: '✅',
  link: '🔗',
  credential: '🔐',
}

const TYPE_LABELS: Record<SavedItem['type'], string> = {
  note: 'Note',
  task: 'Task',
  link: 'Link',
  credential: 'Password',
}

export function CaptureDialog({ open, onClose }: CaptureDialogProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CaptureResult | null>(null)
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) {
      setText('')
      setResult(null)
      setError('')
      setTimeout(() => textareaRef.current?.focus(), 50)
    }
  }, [open])

  async function handleClassify() {
    const trimmed = text.trim()
    if (!trimmed) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await apiFetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setError((err as { message?: string }).message || 'Failed to classify content')
        return
      }
      const data: CaptureResult = await res.json()
      setResult(data)
      if (data.created.length > 0) setText('')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleClassify()
    }
  }

  const hasContent = text.trim().length > 0

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div
        className="fixed inset-0"
        style={{ background: 'rgba(15,12,10,0.5)', backdropFilter: 'blur(4px)' }}
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-end justify-center p-4 sm:items-center">
        <DialogPanel
          className="w-full max-w-xl rounded-2xl overflow-hidden"
          style={{
            background: 'var(--bg)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
            border: '1px solid var(--divider)',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 20px 12px',
            borderBottom: '1px solid var(--divider)',
            background: 'var(--bg2)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SparkleIcon />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>AI Capture</span>
            </div>
            <button
              onClick={onClose}
              style={{ padding: 6, borderRadius: 7, color: 'var(--text3)', cursor: 'pointer', background: 'none', border: 'none' }}
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M2 2l12 12M14 2L2 14" />
              </svg>
            </button>
          </div>

          {/* Input area */}
          <div style={{ padding: '16px 20px' }}>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={e => { setText(e.target.value); setResult(null); setError('') }}
              onKeyDown={handleKeyDown}
              placeholder={`Dump everything here — thoughts, links, passwords, tasks...\n\nExamples:\n• "Call dentist on May 5th"\n• "https://github.com/user/repo — user: john, pass: abc123"\n• "Meeting notes: discussed Q3 roadmap..."\n• Mix it all! AI will sort it out.`}
              rows={7}
              style={{
                width: '100%', fontSize: 13.5, lineHeight: 1.6, resize: 'none',
                border: '1.5px solid var(--divider)', borderRadius: 12,
                background: 'var(--bg2)', color: 'var(--text)', outline: 'none',
                padding: '12px 14px', boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--divider)')}
              disabled={loading}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>⌘↵ to send</span>
              <button
                onClick={handleClassify}
                disabled={!hasContent || loading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                  background: 'var(--accent)', color: '#fff', cursor: hasContent && !loading ? 'pointer' : 'not-allowed',
                  opacity: hasContent && !loading ? 1 : 0.45,
                  border: 'none',
                }}
              >
                {loading ? (
                  <>
                    <Spinner /> Classifying…
                  </>
                ) : (
                  <>
                    <SparkleIcon white /> Classify & Save
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ margin: '0 20px 16px', padding: '10px 14px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca' }}>
              <p style={{ fontSize: 12.5, color: '#dc2626', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Results */}
          {result && (
            <div style={{ borderTop: '1px solid var(--divider)', padding: '14px 20px 18px' }}>
              {result.created.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text3)', fontStyle: 'italic', margin: 0 }}>
                  Couldn&apos;t identify any actionable items. Try adding more context.
                </p>
              ) : (
                <>
                  <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>
                    Saved {result.created.length} item{result.created.length !== 1 ? 's' : ''}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {result.created.map((item, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 12px', borderRadius: 9,
                        background: 'var(--bg2)', border: '1px solid var(--divider)',
                      }}>
                        <span style={{ fontSize: 16 }}>{TYPE_ICONS[item.type]}</span>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                            {TYPE_LABELS[item.type]}
                            {item.date && ` · ${new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                            {item.url && ` · ${(() => { try { return new URL(item.url).hostname } catch { return item.url } })()}`}
                          </div>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 10l4 4 8-8" />
                        </svg>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={onClose}
                    style={{
                      marginTop: 14, width: '100%', padding: '8px', borderRadius: 10, fontSize: 13, fontWeight: 500,
                      background: 'var(--accent)', color: '#fff', cursor: 'pointer', border: 'none',
                    }}
                  >
                    Done
                  </button>
                </>
              )}
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  )
}

function SparkleIcon({ white }: { white?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M12 2l2.4 7.2H22l-6.2 4.5 2.4 7.3L12 17l-6.2 4 2.4-7.3L2 9.2h7.6z"
        fill={white ? '#fff' : 'var(--accent)'} />
    </svg>
  )
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}
