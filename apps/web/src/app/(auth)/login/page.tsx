'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { LoginSchema } from '@flou/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawFrom = searchParams.get('from') ?? ''
  const from = rawFrom.startsWith('/') && !rawFrom.startsWith('//') ? rawFrom : '/home'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const parsed = LoginSchema.safeParse({ email, password })
    if (!parsed.success) {
      const fieldErrors: typeof errors = {}
      for (const e of parsed.error.issues) {
        const field = e.path[0] as 'email' | 'password'
        if (!fieldErrors[field]) fieldErrors[field] = e.message
      }
      setErrors(fieldErrors)
      return false
    }
    setErrors({})
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setErrors({ form: data.message || 'Login failed' }); return }
      router.replace(from)
      router.refresh()
    } catch {
      setErrors({ form: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Google OAuth */}
      <a
        href={`/api/auth/google?from=${encodeURIComponent(from)}`}
        className="flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors"
        style={{ borderColor: 'var(--divider)', background: 'var(--bg)', color: 'var(--text)' }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/>
          <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z"/>
        </svg>
        Continue with Google
      </a>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: 'var(--divider)' }} />
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>or</span>
        <div className="h-px flex-1" style={{ background: 'var(--divider)' }} />
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errors.form && (
          <p className="rounded-lg px-3.5 py-2.5 text-[12px]"
            style={{ background: 'var(--rose)', color: '#b91c1c' }} role="alert">
            {errors.form}
          </p>
        )}
        <Input id="email" label="Email" type="email" placeholder="you@example.com"
          autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <Input id="password" label="Password" type="password" placeholder="••••••••"
          autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <div className="pt-1">
          <Button type="submit" isLoading={loading} className="w-full">Sign in</Button>
        </div>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="mobile-safe-auth flex items-center justify-center bg-[var(--bg)] px-5 py-6 sm:p-6">
      <div className="w-full max-w-[380px]">

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 42 }}>
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
          Welcome back.
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 36 }}>
          Sign in to your calm space.
        </p>

        <Suspense>
          <LoginForm />
        </Suspense>

        <p style={{ marginTop: 24, fontSize: 13, color: 'var(--text3)' }}>
          New here?{' '}
          <Link href="/register" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
