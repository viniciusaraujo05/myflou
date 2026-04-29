'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface UserData {
  id: string
  email: string
  name: string | null
  hasPassword: boolean
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null)

  // Profile form
  const [name, setName] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then((u: UserData) => {
      setUser(u)
      setName(u.name ?? '')
    })
  }, [])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMsg(null)
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() || null }),
      })
      const data = await res.json()
      if (!res.ok) {
        setProfileMsg({ ok: false, text: data.message ?? 'Failed to save' })
      } else {
        setUser(data)
        setName(data.name ?? '')
        setProfileMsg({ ok: true, text: 'Profile updated' })
      }
    } catch {
      setProfileMsg({ ok: false, text: 'Something went wrong' })
    } finally {
      setProfileSaving(false)
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ ok: false, text: 'Passwords do not match' })
      return
    }
    setPasswordSaving(true)
    setPasswordMsg(null)
    try {
      const body: Record<string, string> = { newPassword }
      if (user?.hasPassword && currentPassword) body.currentPassword = currentPassword
      const res = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.status === 204) {
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setPasswordMsg({ ok: true, text: 'Password updated' })
        setUser(prev => prev ? { ...prev, hasPassword: true } : prev)
      } else {
        const data = await res.json()
        setPasswordMsg({ ok: false, text: data.message ?? 'Failed to update password' })
      }
    } catch {
      setPasswordMsg({ ok: false, text: 'Something went wrong' })
    } finally {
      setPasswordSaving(false)
    }
  }

  if (!user) {
    return (
      <main className="app-page flex flex-1 flex-col overflow-y-auto">
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        </div>
      </main>
    )
  }

  const initials = (user.name ?? user.email).slice(0, 2).toUpperCase()

  return (
    <main className="app-page flex flex-1 flex-col overflow-y-auto">
      {/* Header */}
      <div className="app-page-header">
        <div>
          <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>
            Account
          </div>
          <h2 className="app-page-title font-serif" style={{ fontSize: 28, fontWeight: 400, letterSpacing: '0', margin: 0 }}>
            Profile &amp; Settings
          </h2>
        </div>
      </div>

      <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Avatar + email */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '20px 22px', borderRadius: 16,
          background: 'var(--bg2)', border: '1px solid var(--divider)',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
            background: 'var(--sand-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700, color: '#fff',
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
              {user.name ?? 'No name set'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{user.email}</div>
          </div>
        </div>

        {/* Profile section */}
        <Section title="Display name">
          <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input
              id="name"
              label="Name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            {profileMsg && (
              <Feedback ok={profileMsg.ok} text={profileMsg.text} />
            )}
            <div>
              <Button type="submit" isLoading={profileSaving}>
                Save name
              </Button>
            </div>
          </form>
        </Section>

        {/* Password section */}
        <Section title={user.hasPassword ? 'Change password' : 'Set a password'}>
          <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {user.hasPassword && (
              <Input
                id="current-password"
                label="Current password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
              />
            )}
            <Input
              id="new-password"
              label="New password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
            <Input
              id="confirm-password"
              label="Confirm new password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
            {passwordMsg && (
              <Feedback ok={passwordMsg.ok} text={passwordMsg.text} />
            )}
            <p style={{ fontSize: 11, color: 'var(--text3)', margin: 0 }}>
              Min. 8 characters, one uppercase, one number, one special character.
            </p>
            <div>
              <Button type="submit" isLoading={passwordSaving}>
                {user.hasPassword ? 'Update password' : 'Set password'}
              </Button>
            </div>
          </form>
        </Section>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      padding: '22px 24px', borderRadius: 16,
      background: 'var(--bg2)', border: '1px solid var(--divider)',
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{title}</h3>
      {children}
    </div>
  )
}

function Feedback({ ok, text }: { ok: boolean; text: string }) {
  return (
    <p
      style={{
        fontSize: 12, padding: '8px 12px', borderRadius: 8, margin: 0,
        background: ok ? 'var(--emerald-bg, #d1fae5)' : 'var(--rose)',
        color: ok ? '#065f46' : '#b91c1c',
      }}
      role="alert"
    >
      {text}
    </p>
  )
}
