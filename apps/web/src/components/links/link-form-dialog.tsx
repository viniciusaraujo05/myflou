'use client'

import { useState } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import type { Link, LinkCategory } from '@flou/shared'

interface LinkFormDialogProps {
  link?: Link
  categories: LinkCategory[]
  defaultCategoryId: string | null
  onSave: (data: {
    title: string; url: string; description: string | null
    categoryId: string | null; username: string | null; password: string | null
  }, id?: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onClose: () => void
}

export function LinkFormDialog({ link, categories, defaultCategoryId, onSave, onDelete, onClose }: LinkFormDialogProps) {
  const [title, setTitle] = useState(link?.title ?? '')
  const [url, setUrl] = useState(link?.url ?? '')
  const [description, setDescription] = useState(link?.description ?? '')
  const [categoryId, setCategoryId] = useState<string | null>(link?.categoryId ?? defaultCategoryId)
  const [username, setUsername] = useState(link?.username ?? '')
  const [password, setPassword] = useState(link?.password ?? '')
  const [showPassword, setShowPassword] = useState(false)
  const [showCredentials, setShowCredentials] = useState(!!(link?.username || link?.password))
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const trimmedTitle = title.trim()
    const trimmedUrl = url.trim()
    if (!trimmedTitle) { setError('Title is required'); return }
    if (!trimmedUrl) { setError('URL is required'); return }
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      setError('URL must start with http:// or https://'); return
    }
    setSaving(true)
    setError('')
    try {
      await onSave({
        title: trimmedTitle,
        url: trimmedUrl,
        description: description.trim() || null,
        categoryId,
        username: username.trim() || null,
        password: password || null,
      }, link?.id)
    } catch {
      setError('Something went wrong')
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!link || !confirm('Delete this link?')) return
    setDeleting(true)
    try { await onDelete(link.id) } finally { setDeleting(false) }
  }

  return (
    <Dialog open onClose={onClose} className="relative z-50">
      <div className="fixed inset-0" style={{ background: 'rgba(28,24,20,0.3)', backdropFilter: 'blur(2px)' }} aria-hidden="true" />
      <div className="fixed inset-0 flex items-end justify-center p-3 sm:items-center sm:p-4">
        <DialogPanel
          className="max-h-[92dvh] w-full max-w-md overflow-hidden rounded-2xl"
          style={{ background: 'var(--bg)', boxShadow: 'var(--shadow)', border: '1px solid var(--divider)' }}
        >
          <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--divider)', background: 'var(--bg2)' }}>
            <DialogTitle style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
              {link ? 'Edit link' : 'Add link'}
            </DialogTitle>
          </div>

          <form onSubmit={handleSave}>
            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 'calc(92dvh - 126px)', overflowY: 'auto' }}>
              {error && (
                <p style={{ fontSize: 12, color: '#dc2626', padding: '7px 10px', borderRadius: 7, background: '#fef2f2' }}>{error}</p>
              )}

              <Field label="Title">
                <input autoFocus type="text" value={title} onChange={e => setTitle(e.target.value)} maxLength={200} placeholder="My link" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')} onBlur={e => (e.target.style.borderColor = 'var(--divider)')} />
              </Field>

              <Field label="URL">
                <input type="url" value={url} onChange={e => setUrl(e.target.value)} maxLength={2000} placeholder="https://example.com" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')} onBlur={e => (e.target.style.borderColor = 'var(--divider)')} />
              </Field>

              <Field label="Description (optional)">
                <textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={500} rows={2} placeholder="A short note…"
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')} onBlur={e => (e.target.style.borderColor = 'var(--divider)')} />
              </Field>

              {/* Category */}
              <Field label="Category">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <Pill active={categoryId === null} color={null} label="None" onClick={() => setCategoryId(null)} />
                  {categories.map(cat => (
                    <Pill key={cat.id} active={categoryId === cat.id} color={cat.color} label={cat.name}
                      onClick={() => setCategoryId(cat.id === categoryId ? null : cat.id)} />
                  ))}
                </div>
              </Field>

              {/* Credentials toggle */}
              <button
                type="button"
                onClick={() => setShowCredentials(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text3)',
                  cursor: 'pointer', background: 'none', border: 'none', padding: 0,
                }}
              >
                <span style={{ fontSize: 14 }}>{showCredentials ? '▾' : '▸'}</span>
                {showCredentials ? 'Hide credentials' : 'Add username / password'}
              </button>

              {showCredentials && (
                <>
                  <Field label="Username (optional)">
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} maxLength={200} placeholder="Username or email" style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = 'var(--accent)')} onBlur={e => (e.target.style.borderColor = 'var(--divider)')} />
                  </Field>
                  <Field label="Password (optional)">
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        maxLength={500}
                        placeholder="Password"
                        style={{ ...inputStyle, paddingRight: 40 }}
                        onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--divider)')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        style={{
                          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--text3)',
                        }}
                      >
                        {showPassword ? '🙈' : '👁'}
                      </button>
                    </div>
                  </Field>
                </>
              )}
            </div>

            <div className="flex-wrap sm:flex-nowrap" style={{ padding: '12px 22px', borderTop: '1px solid var(--divider)', display: 'flex', gap: 8 }}>
              {link && (
                <button type="button" onClick={handleDelete} disabled={deleting}
                  style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: '1px solid var(--divider)', color: '#dc2626', background: 'transparent', cursor: 'pointer', opacity: deleting ? 0.5 : 1 }}>
                  {deleting ? '…' : 'Delete'}
                </button>
              )}
              <div style={{ flex: 1 }} />
              <button type="button" onClick={onClose}
                style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: '1px solid var(--divider)', color: 'var(--text2)', background: 'transparent', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={saving}
                style={{ padding: '7px 18px', borderRadius: 8, fontSize: 12, fontWeight: 500, background: 'var(--accent)', color: '#fff', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Saving…' : link ? 'Save' : 'Add link'}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', fontSize: 13, padding: '8px 11px', borderRadius: 8,
  border: '1.5px solid var(--divider)', background: 'var(--bg2)',
  color: 'var(--text)', outline: 'none', boxSizing: 'border-box',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function Pill({ active, color, label, onClick }: { active: boolean; color: string | null; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
        border: `1.5px solid ${active && color ? color : active ? 'var(--text)' : 'var(--divider)'}`,
        background: active && color ? color + '22' : active ? 'var(--bg3)' : 'transparent',
        color: active && color ? color : active ? 'var(--text)' : 'var(--text3)',
        cursor: 'pointer',
      }}
    >
      {color && <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />}
      {label}
    </button>
  )
}
