'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Credential, Link } from '@flou/shared'
import { apiFetch } from '@/lib/auth'
import { CredentialFormDialog } from '@/components/passwords/credential-form-dialog'

// Unified entry shown in the list — either a standalone credential or a link with credentials
interface Entry {
  kind: 'credential' | 'link'
  id: string
  service: string    // credential.service or link.title
  username: string
  password: string
  url: string | null
  notes: string | null
  raw: Credential | Link
}

function getDomain(url: string) {
  try { return new URL(url).hostname.replace('www.', '') } catch { return url }
}

function serviceInitial(service: string) {
  return service.trim().charAt(0).toUpperCase()
}

export default function PasswordsPage() {
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [links, setLinks] = useState<Link[]>([])
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState<{ open: boolean; credential?: Credential }>({ open: false })
  const [revealed, setRevealed] = useState<Set<string>>(new Set())

  const load = useCallback(async () => {
    const [credRes, linkRes] = await Promise.all([
      apiFetch('/api/credentials'),
      apiFetch('/api/links'),
    ])
    if (credRes.ok) setCredentials(await credRes.json())
    if (linkRes.ok) {
      const all: Link[] = await linkRes.json()
      setLinks(all.filter(l => l.username || l.password))
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function saveCredential(data: { service: string; username: string; password: string; url: string | null; notes: string | null }, id?: string) {
    if (id) {
      await apiFetch(`/api/credentials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } else {
      await apiFetch('/api/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    }
    setDialog({ open: false })
    await load()
  }

  async function deleteCredential(id: string) {
    await apiFetch(`/api/credentials/${id}`, { method: 'DELETE' })
    setDialog({ open: false })
    await load()
  }

  function toggleReveal(id: string) {
    setRevealed(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text)
  }

  // Build unified sorted entries
  const entries: Entry[] = [
    ...credentials.map(c => ({
      kind: 'credential' as const,
      id: `c-${c.id}`,
      service: c.service,
      username: c.username,
      password: c.password,
      url: c.url,
      notes: c.notes,
      raw: c,
    })),
    ...links.map(l => ({
      kind: 'link' as const,
      id: `l-${l.id}`,
      service: l.title,
      username: l.username ?? '',
      password: l.password ?? '',
      url: l.url,
      notes: l.description,
      raw: l,
    })),
  ].sort((a, b) => a.service.localeCompare(b.service))

  const filtered = search
    ? entries.filter(e =>
        e.service.toLowerCase().includes(search.toLowerCase()) ||
        e.username.toLowerCase().includes(search.toLowerCase())
      )
    : entries

  const credCount = entries.filter(e => e.kind === 'credential').length
  const linkCount = entries.filter(e => e.kind === 'link').length

  return (
    <main className="flex flex-1 flex-col overflow-y-auto" style={{ padding: '32px 36px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>
            Security
          </div>
          <h2 className="font-serif" style={{ fontSize: 28, fontWeight: 400, letterSpacing: '-0.5px', margin: 0 }}>
            Users &amp; Passwords
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
            {credCount} credential{credCount !== 1 ? 's' : ''} · {linkCount} link{linkCount !== 1 ? 's' : ''} with credentials
          </p>
        </div>
        <button
          onClick={() => setDialog({ open: true })}
          style={{
            padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 500,
            background: 'var(--accent)', color: '#fff', cursor: 'pointer', border: 'none',
          }}
        >
          + Add credential
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by service or username…"
          style={{
            width: '100%', maxWidth: 400, fontSize: 13, padding: '9px 14px', borderRadius: 10,
            border: '1.5px solid var(--divider)', background: 'var(--bg2)', color: 'var(--text)',
            outline: 'none', boxSizing: 'border-box',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={e => (e.target.style.borderColor = 'var(--divider)')}
        />
      </div>

      {/* Empty state */}
      {entries.length === 0 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '60px 0' }}>
          <svg width="40" height="40" viewBox="0 0 20 20" fill="none" stroke="var(--text3)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="9" width="14" height="9" rx="2" /><path d="M7 9V6a3 3 0 016 0v3" /><circle cx="10" cy="14" r="1.5" fill="var(--text3)" stroke="none" />
          </svg>
          <p style={{ fontSize: 14, color: 'var(--text3)' }}>No credentials saved yet</p>
          <button
            onClick={() => setDialog({ open: true })}
            style={{ padding: '8px 20px', borderRadius: 10, fontSize: 13, fontWeight: 500, background: 'var(--accent)', color: '#fff', cursor: 'pointer', border: 'none' }}
          >
            Add your first credential
          </button>
        </div>
      )}

      {/* Entries grid */}
      {filtered.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {filtered.map(entry => {
            const isRevealed = revealed.has(entry.id)
            const initial = serviceInitial(entry.service)
            const domain = entry.url ? getDomain(entry.url) : null

            return (
              <div
                key={entry.id}
                style={{
                  padding: '16px 18px', borderRadius: 14,
                  background: 'var(--bg2)',
                  border: '1px solid var(--divider)',
                  boxShadow: 'var(--shadow)',
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}
              >
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  {/* Icon */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: 'var(--accent-bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 700, color: 'var(--accent)',
                  }}>
                    {initial}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.service}
                    </div>
                    {domain && (
                      <div style={{ fontSize: 11, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {domain}
                      </div>
                    )}
                  </div>
                  {/* Kind badge */}
                  <span style={{
                    fontSize: 9, padding: '2px 7px', borderRadius: 8, flexShrink: 0, fontWeight: 600,
                    background: entry.kind === 'credential' ? 'var(--accent-bg)' : 'var(--bg3)',
                    color: entry.kind === 'credential' ? 'var(--accent)' : 'var(--text3)',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>
                    {entry.kind === 'credential' ? 'Saved' : 'Link'}
                  </span>
                </div>

                {/* Credentials */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {/* Username */}
                  {entry.username && (
                    <CredRow
                      icon="👤"
                      label={entry.username}
                      onCopy={() => copyToClipboard(entry.username)}
                    />
                  )}
                  {/* Password */}
                  {entry.password && (
                    <CredRow
                      icon="🔑"
                      label={isRevealed ? entry.password : '••••••••••'}
                      onCopy={() => copyToClipboard(entry.password)}
                      action={
                        <button
                          onClick={() => toggleReveal(entry.id)}
                          style={{ fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: '0 2px' }}
                          title={isRevealed ? 'Hide' : 'Show'}
                        >
                          {isRevealed ? '🙈' : '👁'}
                        </button>
                      }
                    />
                  )}
                </div>

                {/* Notes */}
                {entry.notes && (
                  <p style={{ fontSize: 11.5, color: 'var(--text3)', lineHeight: 1.5, margin: 0 }}>{entry.notes}</p>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                  {entry.url && (
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px', borderRadius: 7, fontSize: 11.5, fontWeight: 500,
                        background: 'var(--bg)', border: '1px solid var(--divider)',
                        color: 'var(--text2)', textDecoration: 'none',
                      }}
                    >
                      ↗ Open
                    </a>
                  )}
                  {entry.kind === 'credential' && (
                    <button
                      onClick={() => setDialog({ open: true, credential: entry.raw as Credential })}
                      style={{
                        padding: '4px 10px', borderRadius: 7, fontSize: 11.5, fontWeight: 500,
                        background: 'var(--bg)', border: '1px solid var(--divider)',
                        color: 'var(--text2)', cursor: 'pointer',
                      }}
                    >
                      ✎ Edit
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* No search results */}
      {filtered.length === 0 && entries.length > 0 && (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--text3)' }}>No results for &ldquo;{search}&rdquo;</p>
        </div>
      )}

      {/* Dialog */}
      {dialog.open && (
        <CredentialFormDialog
          credential={dialog.credential}
          onSave={saveCredential}
          onDelete={deleteCredential}
          onClose={() => setDialog({ open: false })}
        />
      )}
    </main>
  )
}

function CredRow({ icon, label, onCopy, action }: { icon: string; label: string; onCopy: () => void; action?: React.ReactNode }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '6px 10px', borderRadius: 8, background: 'var(--bg)',
      border: '1px solid var(--divider)',
    }}>
      <span style={{ fontSize: 13 }}>{icon}</span>
      <span style={{
        flex: 1, fontSize: 12.5, color: 'var(--text)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        fontFamily: label.startsWith('•') ? 'monospace' : 'inherit',
      }}>
        {label}
      </span>
      {action}
      <button
        onClick={handleCopy}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: copied ? '#10b981' : 'var(--text3)', flexShrink: 0 }}
        title="Copy"
      >
        {copied ? '✓' : '⎘'}
      </button>
    </div>
  )
}
