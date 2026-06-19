'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Transaction, Subscription, TransactionType, BillingCycle } from '@flou/shared'
import { apiFetch } from '@/lib/auth'

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt(amount: number) {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(amount)
}

function monthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleString('default', { month: 'long', year: 'numeric' })
}

function toMonthlyAmount(amount: number, cycle: BillingCycle) {
  if (cycle === 'WEEKLY') return amount * 4.33
  if (cycle === 'QUARTERLY') return amount / 3
  if (cycle === 'YEARLY') return amount / 12
  return amount
}

function daysUntil(dateStr: string) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  return Math.ceil((target.getTime() - today.getTime()) / 86400000)
}

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Housing', 'Health', 'Entertainment', 'Shopping', 'Education', 'Utilities', 'Other']
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift', 'Refund', 'Other']
const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = { WEEKLY: 'Weekly', MONTHLY: 'Monthly', QUARTERLY: 'Quarterly', YEARLY: 'Yearly' }

// ─── sub-components ─────────────────────────────────────────────────────────

function StatCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--divider)', borderRadius: 16, padding: '20px 22px', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>
      <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>{value}</span>
    </div>
  )
}

function CategoryBadge({ category, type }: { category: string; type?: TransactionType }) {
  const isIncome = type === 'INCOME'
  return (
    <span style={{
      display: 'inline-block', padding: '2px 9px', borderRadius: 20, fontSize: 10.5, fontWeight: 600,
      background: isIncome ? 'oklch(0.94 0.04 155)' : 'var(--bg3)',
      color: isIncome ? 'var(--accent)' : 'var(--text2)',
      letterSpacing: '0.02em',
    }}>
      {category}
    </span>
  )
}

// ─── dialogs ────────────────────────────────────────────────────────────────

function Overlay({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)', zIndex: 50 }}
    />
  )
}

function DialogBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      zIndex: 51, background: 'var(--bg)', borderRadius: 20, padding: '28px 28px 24px',
      width: '100%', maxWidth: 440, boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      border: '1px solid var(--divider)', maxHeight: '90vh', overflowY: 'auto',
    }}>
      {children}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text2)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{children}</label>
}

function Field({ children }: { children: React.ReactNode }) {
  return <div style={{ marginBottom: 16 }}>{children}</div>
}

function inputStyle(focused?: boolean): React.CSSProperties {
  return {
    width: '100%', fontSize: 13, padding: '9px 12px', borderRadius: 10, boxSizing: 'border-box',
    border: `1.5px solid ${focused ? 'var(--accent)' : 'var(--divider)'}`,
    background: 'var(--bg2)', color: 'var(--text)', outline: 'none',
  }
}

function TransactionDialog({
  transaction,
  onSave,
  onDelete,
  onClose,
}: {
  transaction?: Transaction
  onSave: (data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, id?: string) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  onClose: () => void
}) {
  const today = new Date().toISOString().split('T')[0]
  const [type, setType] = useState<TransactionType>(transaction?.type ?? 'EXPENSE')
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : '')
  const [category, setCategory] = useState(transaction?.category ?? '')
  const [description, setDescription] = useState(transaction?.description ?? '')
  const [date, setDate] = useState(transaction?.date ?? today)
  const [saving, setSaving] = useState(false)
  const [focused, setFocused] = useState('')

  const categories = type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || !category || !date) return
    setSaving(true)
    await onSave({ type, amount: parseFloat(amount), category, description: description || null, date, spaceId: transaction?.spaceId ?? null }, transaction?.id)
    setSaving(false)
  }

  return (
    <>
      <Overlay onClose={onClose} />
      <DialogBox>
        <div style={{ marginBottom: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            {transaction ? 'Edit transaction' : 'New transaction'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text3)', lineHeight: 1 }}>×</button>
        </div>

        {/* Type toggle */}
        <Field>
          <FieldLabel>Type</FieldLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {(['INCOME', 'EXPENSE'] as TransactionType[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => { setType(t); setCategory('') }}
                style={{
                  padding: '9px 0', borderRadius: 10, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', border: 'none',
                  background: type === t ? (t === 'INCOME' ? 'oklch(0.90 0.04 155)' : 'var(--rose)') : 'var(--bg2)',
                  color: type === t ? (t === 'INCOME' ? 'var(--accent)' : 'oklch(0.45 0.09 18)') : 'var(--text3)',
                }}
              >
                {t === 'INCOME' ? '↑ Income' : '↓ Expense'}
              </button>
            ))}
          </div>
        </Field>

        <form onSubmit={handleSubmit}>
          <Field>
            <FieldLabel>Amount (€)</FieldLabel>
            <input
              type="number" step="0.01" min="0.01" required
              value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0,00" style={inputStyle(focused === 'amount')}
              onFocus={() => setFocused('amount')} onBlur={() => setFocused('')}
            />
          </Field>

          <Field>
            <FieldLabel>Category</FieldLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {categories.map(c => (
                <button
                  key={c} type="button" onClick={() => setCategory(c)}
                  style={{
                    padding: '5px 12px', borderRadius: 20, fontSize: 11.5, fontWeight: 500, cursor: 'pointer',
                    border: `1.5px solid ${category === c ? 'var(--accent)' : 'var(--divider)'}`,
                    background: category === c ? 'var(--accent-bg)' : 'var(--bg2)',
                    color: category === c ? 'var(--accent)' : 'var(--text2)',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </Field>

          <Field>
            <FieldLabel>Date</FieldLabel>
            <input
              type="date" required
              value={date} onChange={e => setDate(e.target.value)}
              style={inputStyle(focused === 'date')}
              onFocus={() => setFocused('date')} onBlur={() => setFocused('')}
            />
          </Field>

          <Field>
            <FieldLabel>Description (optional)</FieldLabel>
            <input
              type="text" maxLength={500}
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="What was this for?"
              style={inputStyle(focused === 'desc')}
              onFocus={() => setFocused('desc')} onBlur={() => setFocused('')}
            />
          </Field>

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            {transaction && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(transaction.id)}
                style={{ flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 12.5, fontWeight: 600, border: '1.5px solid var(--divider)', background: 'var(--bg)', color: 'oklch(0.50 0.09 18)', cursor: 'pointer' }}
              >
                Delete
              </button>
            )}
            <button
              type="submit" disabled={saving || !category}
              style={{ flex: 2, padding: '10px 0', borderRadius: 10, fontSize: 12.5, fontWeight: 600, border: 'none', background: 'var(--accent)', color: '#fff', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Saving…' : transaction ? 'Update' : 'Add transaction'}
            </button>
          </div>
        </form>
      </DialogBox>
    </>
  )
}

function SubscriptionDialog({
  subscription,
  onSave,
  onDelete,
  onClose,
}: {
  subscription?: Subscription
  onSave: (data: Omit<Subscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, id?: string) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  onClose: () => void
}) {
  const today = new Date().toISOString().split('T')[0]
  const [name, setName] = useState(subscription?.name ?? '')
  const [amount, setAmount] = useState(subscription ? String(subscription.amount) : '')
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(subscription?.billingCycle ?? 'MONTHLY')
  const [nextBillingDate, setNextBillingDate] = useState(subscription?.nextBillingDate ?? today)
  const [active, setActive] = useState(subscription?.active ?? true)
  const [description, setDescription] = useState(subscription?.description ?? '')
  const [category, setCategory] = useState(subscription?.category ?? '')
  const [saving, setSaving] = useState(false)
  const [focused, setFocused] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !amount || !nextBillingDate) return
    setSaving(true)
    await onSave({
      name, amount: parseFloat(amount), billingCycle, nextBillingDate, active,
      description: description || null, category: category || null, spaceId: subscription?.spaceId ?? null,
    }, subscription?.id)
    setSaving(false)
  }

  return (
    <>
      <Overlay onClose={onClose} />
      <DialogBox>
        <div style={{ marginBottom: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            {subscription ? 'Edit subscription' : 'New subscription'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text3)', lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <Field>
            <FieldLabel>Service name</FieldLabel>
            <input
              type="text" required maxLength={200}
              value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Netflix, Spotify…"
              style={inputStyle(focused === 'name')}
              onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field>
              <FieldLabel>Amount (€)</FieldLabel>
              <input
                type="number" step="0.01" min="0.01" required
                value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0,00" style={inputStyle(focused === 'amount')}
                onFocus={() => setFocused('amount')} onBlur={() => setFocused('')}
              />
            </Field>
            <Field>
              <FieldLabel>Billing cycle</FieldLabel>
              <select
                value={billingCycle} onChange={e => setBillingCycle(e.target.value as BillingCycle)}
                style={{ ...inputStyle(focused === 'cycle'), appearance: 'none' as const }}
                onFocus={() => setFocused('cycle')} onBlur={() => setFocused('')}
              >
                {(Object.keys(BILLING_CYCLE_LABELS) as BillingCycle[]).map(c => (
                  <option key={c} value={c}>{BILLING_CYCLE_LABELS[c]}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field>
            <FieldLabel>Next billing date</FieldLabel>
            <input
              type="date" required
              value={nextBillingDate} onChange={e => setNextBillingDate(e.target.value)}
              style={inputStyle(focused === 'date')}
              onFocus={() => setFocused('date')} onBlur={() => setFocused('')}
            />
          </Field>

          <Field>
            <FieldLabel>Category (optional)</FieldLabel>
            <input
              type="text" maxLength={100}
              value={category} onChange={e => setCategory(e.target.value)}
              placeholder="e.g. Streaming, SaaS, Health…"
              style={inputStyle(focused === 'cat')}
              onFocus={() => setFocused('cat')} onBlur={() => setFocused('')}
            />
          </Field>

          <Field>
            <FieldLabel>Description (optional)</FieldLabel>
            <input
              type="text" maxLength={500}
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Notes about this subscription"
              style={inputStyle(focused === 'desc')}
              onFocus={() => setFocused('desc')} onBlur={() => setFocused('')}
            />
          </Field>

          <Field>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div
                onClick={() => setActive(v => !v)}
                style={{
                  width: 40, height: 22, borderRadius: 11, cursor: 'pointer', transition: 'background 0.2s',
                  background: active ? 'var(--accent)' : 'var(--bg3)', position: 'relative', flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute', top: 3, left: active ? 21 : 3,
                  width: 16, height: 16, borderRadius: '50%', background: '#fff',
                  transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                }} />
              </div>
              <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>Active subscription</span>
            </label>
          </Field>

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            {subscription && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(subscription.id)}
                style={{ flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 12.5, fontWeight: 600, border: '1.5px solid var(--divider)', background: 'var(--bg)', color: 'oklch(0.50 0.09 18)', cursor: 'pointer' }}
              >
                Delete
              </button>
            )}
            <button
              type="submit" disabled={saving}
              style={{ flex: 2, padding: '10px 0', borderRadius: 10, fontSize: 12.5, fontWeight: 600, border: 'none', background: 'var(--accent)', color: '#fff', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Saving…' : subscription ? 'Update' : 'Add subscription'}
            </button>
          </div>
        </form>
      </DialogBox>
    </>
  )
}

// ─── main view ───────────────────────────────────────────────────────────────

export function FinanceView() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [tab, setTab] = useState<'transactions' | 'subscriptions'>('transactions')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [txDialog, setTxDialog] = useState<{ open: boolean; tx?: Transaction }>({ open: false })
  const [subDialog, setSubDialog] = useState<{ open: boolean; sub?: Subscription }>({ open: false })

  const from = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const lastDay = new Date(year, month + 1, 0).getDate()
  const to = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const load = useCallback(async () => {
    const [txRes, subRes] = await Promise.all([
      apiFetch(`/api/transactions?from=${from}&to=${to}`),
      apiFetch('/api/subscriptions'),
    ])
    if (txRes.ok) setTransactions(await txRes.json())
    if (subRes.ok) setSubscriptions(await subRes.json())
  }, [from, to])

  useEffect(() => { load() }, [load])

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  async function saveTransaction(
    data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
    id?: string,
  ) {
    if (id) {
      await apiFetch(`/api/transactions/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      })
    } else {
      await apiFetch('/api/transactions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      })
    }
    setTxDialog({ open: false })
    await load()
  }

  async function deleteTransaction(id: string) {
    await apiFetch(`/api/transactions/${id}`, { method: 'DELETE' })
    setTxDialog({ open: false })
    await load()
  }

  async function saveSubscription(
    data: Omit<Subscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
    id?: string,
  ) {
    if (id) {
      await apiFetch(`/api/subscriptions/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      })
    } else {
      await apiFetch('/api/subscriptions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      })
    }
    setSubDialog({ open: false })
    await load()
  }

  async function deleteSubscription(id: string) {
    await apiFetch(`/api/subscriptions/${id}`, { method: 'DELETE' })
    setSubDialog({ open: false })
    await load()
  }

  // ── computed stats ──────────────────────────────────────────────────────
  const income = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
  const expenses = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
  const balance = income - expenses
  const activeSubs = subscriptions.filter(s => s.active)
  const monthlySubTotal = activeSubs.reduce((s, sub) => s + toMonthlyAmount(sub.amount, sub.billingCycle), 0)

  // Group transactions by date
  const grouped = transactions.reduce<Record<string, Transaction[]>>((acc, t) => {
    acc[t.date] = acc[t.date] ? [...acc[t.date], t] : [t]
    return acc
  }, {})
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <main className="app-page flex flex-1 flex-col overflow-y-auto">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="app-page-header">
        <div>
          <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>
            Personal Finance
          </div>
          <h2 className="app-page-title font-serif" style={{ fontSize: 28, fontWeight: 400, margin: 0 }}>
            Finance
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
            {transactions.length} transactions · {activeSubs.length} active subscriptions
          </p>
        </div>
        <div className="app-actions">
          <button
            onClick={() => setSubDialog({ open: true })}
            style={{ padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 500, background: 'var(--bg2)', color: 'var(--text2)', cursor: 'pointer', border: '1.5px solid var(--divider)' }}
          >
            + Subscription
          </button>
          <button
            onClick={() => setTxDialog({ open: true })}
            style={{ padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 500, background: 'var(--accent)', color: '#fff', cursor: 'pointer', border: 'none' }}
          >
            + Transaction
          </button>
        </div>
      </div>

      {/* ── Summary cards ───────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 12, marginBottom: 28 }}>
        <StatCard
          label="Income"
          value={fmt(income)}
          color="oklch(0.92 0.06 155)"
          icon={<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 16V4M4 10l6-6 6 6" /></svg>}
        />
        <StatCard
          label="Expenses"
          value={fmt(expenses)}
          color="var(--rose)"
          icon={<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="oklch(0.55 0.09 18)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 4v12M4 10l6 6 6-6" /></svg>}
        />
        <StatCard
          label="Balance"
          value={fmt(balance)}
          color={balance >= 0 ? 'var(--accent-bg)' : 'var(--rose)'}
          icon={<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke={balance >= 0 ? 'var(--accent)' : 'oklch(0.55 0.09 18)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="7" /><path d="M10 7v6M7 10h6" /></svg>}
        />
        <StatCard
          label="Monthly subs"
          value={fmt(monthlySubTotal)}
          color="var(--lavender)"
          icon={<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="oklch(0.45 0.07 278)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="16" height="12" rx="2" /><path d="M2 9h16M6 2v4M14 2v4" /></svg>}
        />
      </div>

      {/* ── Month navigation ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={prevMonth} style={{ width: 30, height: 30, borderRadius: 8, border: '1.5px solid var(--divider)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)', fontSize: 14 }}>
          ‹
        </button>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', minWidth: 150, textAlign: 'center', textTransform: 'capitalize' }}>
          {monthLabel(year, month)}
        </span>
        <button onClick={nextMonth} style={{ width: 30, height: 30, borderRadius: 8, border: '1.5px solid var(--divider)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)', fontSize: 14 }}>
          ›
        </button>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg2)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {(['transactions', 'subscriptions'] as const).map(t => (
          <button
            key={t} onClick={() => setTab(t)}
            style={{
              padding: '7px 20px', borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.15s',
              background: tab === t ? 'var(--bg)' : 'transparent',
              color: tab === t ? 'var(--text)' : 'var(--text3)',
              boxShadow: tab === t ? 'var(--shadow)' : 'none',
            }}
          >
            {t === 'transactions' ? `Transactions (${transactions.length})` : `Subscriptions (${subscriptions.length})`}
          </button>
        ))}
      </div>

      {/* ── Transactions Tab ────────────────────────────────────────────── */}
      {tab === 'transactions' && (
        <div className="fade-in">
          {transactions.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '60px 0' }}>
              <svg width="40" height="40" viewBox="0 0 20 20" fill="none" stroke="var(--text3)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="16" height="14" rx="3" /><path d="M2 8h16M6 12h3M12 12h2" />
              </svg>
              <p style={{ fontSize: 14, color: 'var(--text3)' }}>No transactions in {monthLabel(year, month)}</p>
              <button
                onClick={() => setTxDialog({ open: true })}
                style={{ padding: '8px 20px', borderRadius: 10, fontSize: 13, fontWeight: 500, background: 'var(--accent)', color: '#fff', cursor: 'pointer', border: 'none' }}
              >
                Add first transaction
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {sortedDates.map(date => (
                <div key={date}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                    {new Date(date + 'T12:00:00').toLocaleDateString('default', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {grouped[date].map(tx => (
                      <div
                        key={tx.id}
                        onClick={() => setTxDialog({ open: true, tx })}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
                          borderRadius: 12, background: 'var(--bg2)', border: '1px solid var(--divider)',
                          cursor: 'pointer', transition: 'background 0.12s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg2)')}
                      >
                        {/* Icon */}
                        <div style={{
                          width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: tx.type === 'INCOME' ? 'oklch(0.92 0.06 155)' : 'var(--rose)',
                        }}>
                          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke={tx.type === 'INCOME' ? 'var(--accent)' : 'oklch(0.55 0.09 18)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            {tx.type === 'INCOME'
                              ? <path d="M10 16V4M4 10l6-6 6 6" />
                              : <path d="M10 4v12M4 10l6 6 6-6" />}
                          </svg>
                        </div>
                        {/* Info */}
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                            <CategoryBadge category={tx.category} type={tx.type} />
                          </div>
                          {tx.description && (
                            <div style={{ fontSize: 12, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {tx.description}
                            </div>
                          )}
                        </div>
                        {/* Amount */}
                        <div style={{ fontSize: 14, fontWeight: 700, flexShrink: 0, color: tx.type === 'INCOME' ? 'var(--accent)' : 'oklch(0.50 0.09 18)' }}>
                          {tx.type === 'INCOME' ? '+' : '−'}{fmt(tx.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Subscriptions Tab ───────────────────────────────────────────── */}
      {tab === 'subscriptions' && (
        <div className="fade-in">
          {subscriptions.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '60px 0' }}>
              <svg width="40" height="40" viewBox="0 0 20 20" fill="none" stroke="var(--text3)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="16" height="12" rx="2" /><path d="M2 9h16M6 2v4M14 2v4" />
              </svg>
              <p style={{ fontSize: 14, color: 'var(--text3)' }}>No subscriptions tracked yet</p>
              <button
                onClick={() => setSubDialog({ open: true })}
                style={{ padding: '8px 20px', borderRadius: 10, fontSize: 13, fontWeight: 500, background: 'var(--accent)', color: '#fff', cursor: 'pointer', border: 'none' }}
              >
                Add first subscription
              </button>
            </div>
          ) : (
            <div className="responsive-card-grid-wide">
              {subscriptions.map(sub => {
                const days = daysUntil(sub.nextBillingDate)
                const isOverdue = days < 0
                const isSoon = days >= 0 && days <= 5
                const monthlyEq = toMonthlyAmount(sub.amount, sub.billingCycle)

                return (
                  <div
                    key={sub.id}
                    style={{
                      padding: '18px 20px', borderRadius: 16, background: 'var(--bg2)',
                      border: `1px solid ${!sub.active ? 'var(--divider)' : isSoon || isOverdue ? 'oklch(0.85 0.05 78)' : 'var(--divider)'}`,
                      boxShadow: 'var(--shadow)', opacity: sub.active ? 1 : 0.6,
                      display: 'flex', flexDirection: 'column', gap: 12,
                    }}
                  >
                    {/* Top row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: 'var(--lavender)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'oklch(0.45 0.07 278)' }}>
                        {sub.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{sub.name}</div>
                        {sub.category && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{sub.category}</div>}
                      </div>
                      <button
                        onClick={() => setSubDialog({ open: true, sub })}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 13, padding: 4 }}
                        title="Edit"
                      >
                        ✎
                      </button>
                    </div>

                    {/* Amount info */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>{fmt(sub.amount)}</span>
                      <span style={{ fontSize: 11.5, color: 'var(--text3)', fontWeight: 500 }}>/ {BILLING_CYCLE_LABELS[sub.billingCycle].toLowerCase()}</span>
                    </div>
                    {sub.billingCycle !== 'MONTHLY' && (
                      <div style={{ fontSize: 11.5, color: 'var(--text3)' }}>≈ {fmt(monthlyEq)} / month</div>
                    )}

                    {/* Description */}
                    {sub.description && (
                      <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0, lineHeight: 1.5 }}>{sub.description}</p>
                    )}

                    {/* Next billing */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10,
                      background: isOverdue ? 'var(--rose)' : isSoon ? 'var(--sand)' : 'var(--bg)',
                      border: '1px solid var(--divider)',
                    }}>
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="5" width="16" height="12" rx="2" /><path d="M2 9h16M6 2v4M14 2v4" />
                      </svg>
                      <span style={{ fontSize: 12, color: isOverdue ? 'oklch(0.50 0.09 18)' : isSoon ? 'oklch(0.50 0.08 78)' : 'var(--text2)', fontWeight: 500, flex: 1 }}>
                        {isOverdue ? `Overdue by ${Math.abs(days)}d` : days === 0 ? 'Due today' : `Due in ${days}d`}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                        {new Date(sub.nextBillingDate + 'T12:00:00').toLocaleDateString('default', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    {/* Active badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                        background: sub.active ? 'var(--accent-bg)' : 'var(--bg3)',
                        color: sub.active ? 'var(--accent)' : 'var(--text3)',
                      }}>
                        {sub.active ? 'Active' : 'Paused'}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>{BILLING_CYCLE_LABELS[sub.billingCycle]}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Dialogs ─────────────────────────────────────────────────────── */}
      {txDialog.open && (
        <TransactionDialog
          transaction={txDialog.tx}
          onSave={saveTransaction}
          onDelete={deleteTransaction}
          onClose={() => setTxDialog({ open: false })}
        />
      )}
      {subDialog.open && (
        <SubscriptionDialog
          subscription={subDialog.sub}
          onSave={saveSubscription}
          onDelete={deleteSubscription}
          onClose={() => setSubDialog({ open: false })}
        />
      )}
    </main>
  )
}
