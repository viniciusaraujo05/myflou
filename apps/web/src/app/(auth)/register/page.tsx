'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { RegisterSchema } from '@flou/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordStrength } from '@/components/ui/password-strength'

export default function RegisterPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string; form?: string }>({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const newErrors: typeof errors = {}
    const parsed = RegisterSchema.safeParse({ email, password })
    if (!parsed.success) {
      for (const e of parsed.error.errors) {
        const field = e.path[0] as 'email' | 'password'
        if (!newErrors[field]) newErrors[field] = e.message
      }
    }
    if (password && confirm && password !== confirm) newErrors.confirm = 'Passwords do not match'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setErrors({ form: data.message || 'Registration failed' }); return }
      router.replace('/home')
      router.refresh()
    } catch {
      setErrors({ form: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mobile-safe-auth flex items-center justify-center bg-[var(--bg)] px-5 py-6 sm:p-6">
      <div className="w-full max-w-[380px]">

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 34 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="font-serif italic font-medium text-white" style={{ fontSize: 12 }}>fl</span>
          </div>
          <span className="font-serif" style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.3px' }}>flou</span>
        </div>

        {/* Heading */}
        <h1 className="font-serif" style={{ fontWeight: 400, fontSize: 32, lineHeight: 1.15, letterSpacing: '0', marginBottom: 8 }}>
          Start fresh.
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 36 }}>
          Create your calm space. Free, no card required.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {errors.form && (
            <p className="rounded-lg px-3.5 py-2.5 text-[12px]"
              style={{ background: 'var(--rose)', color: '#b91c1c' }} role="alert">
              {errors.form}
            </p>
          )}

          <Input id="email" label="Email" type="email" placeholder="you@example.com"
            autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />

          <div className="space-y-2">
            <Input id="password" label="Password" type="password" placeholder="••••••••"
              autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
            <PasswordStrength password={password} />
          </div>

          <Input id="confirm" label="Confirm password" type="password" placeholder="••••••••"
            autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />

          <div className="pt-1">
            <Button type="submit" isLoading={loading} className="w-full">Create account</Button>
          </div>
        </form>

        <p style={{ marginTop: 24, fontSize: 13, color: 'var(--text3)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
