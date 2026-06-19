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
