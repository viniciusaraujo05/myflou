'use client'

import { useState } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import type { Credential } from '@flou/shared'

interface CredentialFormDialogProps {
  credential?: Credential
  onSave: (data: { service: string; username: string; password: string; url: string | null; notes: string | null }, id?: string) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  onClose: () => void
}

export function CredentialFormDialog({ credential, onSave, onDelete, onClose }: CredentialFormDialogProps) {
  const [service, setService] = useState(credential?.service ?? '')
  const [username, setUsername] = useState(credential?.username ?? '')
  const [password, setPassword] = useState(credential?.password ?? '')
  const [url, setUrl] = useState(credential?.url ?? '')
  const [notes, setNotes] = useState(credential?.notes ?? '')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!service.trim()) { setError('Service name is required'); return }
    if (!username.trim()) { setError('Username is required'); return }
    if (!password) { setError('Password is required'); return }
    setSaving(true)
    setError('')
    try {
      await onSave({
        service: service.trim(),
        username: username.trim(),
        password,
        url: url.trim() || null,
        notes: notes.trim() || null,
      }, credential?.id)
    } catch {
      setError('Something went wrong')
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!credential || !onDelete || !confirm(`Delete credentials for "${credential.service}"?`)) return
    setDeleting(true)
    try { await onDelete(credential.id) } finally { setDeleting(false) }
  }

  return (
    <Dialog open onClose={onClose} className="relative z-50">
      <div className="fixed inset-0" style={{ background: 'rgba(28,24,20,0.35)', backdropFilter: 'blur(3px)' }} aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          className="w-full max-w-md rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg)', boxShadow: 'var(--shadow)', border: '1px solid var(--divider)' }}
        >
          <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--divider)', background: 'var(--bg2)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="9" width="14" height="9" rx="2" /><path d="M7 9V6a3 3 0 016 0v3" /><circle cx="10" cy="14" r="1.5" fill="var(--accent)" stroke="none" />
            </svg>
            <DialogTitle style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
              {credential ? 'Edit credential' : 'Add credential'}
            </DialogTitle>
          </div>

          <form onSubmit={handleSave}>
            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {error && <p style={{ fontSize: 12, color: '#dc2626', padding: '7px 10px', borderRadius: 7, background: '#fef2f2', margin: 0 }}>{error}</p>}

              <Field label="Service / App">
                <input autoFocus type="text" value={service} onChange={e => setService(e.target.value)} maxLength={200} placeholder="Gmail, GitHub, Netflix…" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')} onBlur={e => (e.target.style.borderColor = 'var(--divider)')} />
              </Field>

              <Field label="Username / Email">
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} maxLength={500} placeholder="user@email.com" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')} onBlur={e => (e.target.style.borderColor = 'var(--divider)')} />
              </Field>

              <Field label="Password">
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    maxLength={1000}
                    placeholder="Password"
                    style={{ ...inputStyle, paddingRight: 40 }}
                    onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--divider)')}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: 'var(--text3)' }}>
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </Field>

              <Field label="URL (optional)">
                <input type="url" value={url} onChange={e => setUrl(e.target.value)} maxLength={2000} placeholder="https://mail.google.com" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')} onBlur={e => (e.target.style.borderColor = 'var(--divider)')} />
              </Field>

              <Field label="Notes (optional)">
                <textarea value={notes} onChange={e => setNotes(e.target.value)} maxLength={2000} rows={2} placeholder="Any notes…"
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')} onBlur={e => (e.target.style.borderColor = 'var(--divider)')} />
              </Field>
            </div>

            <div style={{ padding: '12px 22px', borderTop: '1px solid var(--divider)', display: 'flex', gap: 8 }}>
              {credential && onDelete && (
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
                {saving ? 'Saving…' : credential ? 'Save' : 'Add'}
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
  color: 'var(--text)', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
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
