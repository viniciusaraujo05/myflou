'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogPanel, Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from '@headlessui/react'
import type { Status } from '@flou/shared'
import { useSpaces } from '@/components/spaces/space-context'
import { useTheme } from '@/components/theme/theme-provider'
import { useFocus } from '@/components/focus/focus-context'
import { apiFetch } from '@/lib/auth'
import { SpaceFormDialog } from '@/components/spaces/space-form-dialog'
import { MilestoneFormDialog } from '@/components/roadmap/milestone-form-dialog'
import { TaskCreateDialog } from '@/components/ui/task-create-dialog'

interface Action {
  id: string
  label: string
  group: string
  keywords?: string
  run: () => void
}

const VIEWS: { label: string; href: string }[] = [
  { label: 'Home', href: '/home' },
  { label: 'Inbox', href: '/inbox' },
  { label: 'Tasks', href: '/tasks' },
  { label: 'Roadmap', href: '/roadmap' },
  { label: 'Calendar', href: '/calendar' },
  { label: 'Notes', href: '/notes' },
  { label: 'Links', href: '/links' },
  { label: 'Passwords', href: '/passwords' },
  { label: 'Finance', href: '/finance' },
  { label: 'Preferences', href: '/preferences' },
]

export function CommandPalette() {
  const router = useRouter()
  const { spaces, refresh } = useSpaces()
  const { toggle: toggleTheme } = useTheme()
  const { active: activeFocus, start: startFocus, stop: stopFocus } = useFocus()

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [statuses, setStatuses] = useState<Status[]>([])
  const [spaceDialog, setSpaceDialog] = useState(false)
  const [milestoneDialog, setMilestoneDialog] = useState(false)
  const [taskDialog, setTaskDialog] = useState(false)

  // Global ⌘K / Ctrl+K toggle
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      apiFetch('/api/statuses').then(r => (r.ok ? r.json() : [])).then(setStatuses)
    }
  }, [open])

  const actions = useMemo<Action[]>(() => {
    const go = (href: string) => () => router.push(href)
    const list: Action[] = [
      { id: 'new-task', label: 'New task', group: 'Create', keywords: 'add create task', run: () => setTaskDialog(true) },
      { id: 'new-milestone', label: 'New milestone', group: 'Create', keywords: 'roadmap', run: () => setMilestoneDialog(true) },
      { id: 'new-space', label: 'New space', group: 'Create', run: () => setSpaceDialog(true) },
      activeFocus
        ? { id: 'stop-focus', label: 'Stop focus session', group: 'Actions', keywords: 'timer time tracking pomodoro', run: () => { void stopFocus() } }
        : { id: 'start-focus', label: 'Start focus session', group: 'Actions', keywords: 'timer time tracking pomodoro', run: () => { void startFocus() } },
      { id: 'toggle-theme', label: 'Toggle light / dark theme', group: 'Actions', keywords: 'dark light mode appearance', run: toggleTheme },
      ...spaces.filter(s => !s.archived).map(s => ({
        id: `space-${s.id}`, label: `Open ${s.name}`, group: 'Spaces', keywords: s.name, run: go(`/space/${s.id}`),
      })),
      ...VIEWS.map(v => ({ id: `view-${v.href}`, label: `Go to ${v.label}`, group: 'Views', keywords: v.label, run: go(v.href) })),
    ]
    return list
  }, [spaces, router, toggleTheme, activeFocus, startFocus, stopFocus])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return actions
    return actions.filter(a => (a.label + ' ' + (a.keywords ?? '')).toLowerCase().includes(q))
  }, [actions, query])

  const groups = useMemo(() => {
    const map = new Map<string, Action[]>()
    for (const a of filtered) {
      if (!map.has(a.group)) map.set(a.group, [])
      map.get(a.group)!.push(a)
    }
    return [...map.entries()]
  }, [filtered])

  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-[60]">
        <div className="fixed inset-0" style={{ background: 'rgba(15,12,10,0.5)', backdropFilter: 'blur(4px)' }} />
        <div className="fixed inset-0 flex items-start justify-center p-4 pt-[12vh]">
          <DialogPanel className="w-full max-w-lg overflow-hidden rounded-2xl" style={{ background: 'var(--bg)', boxShadow: 'var(--shadow)', border: '1px solid var(--divider)' }}>
            <Combobox<Action>
              onChange={(action) => { if (action) { setOpen(false); action.run() } }}
            >
              <div style={{ borderBottom: '1px solid var(--divider)' }}>
                <ComboboxInput
                  autoFocus
                  className="w-full bg-transparent px-4 py-3.5 text-[15px] outline-none"
                  style={{ color: 'var(--text)' }}
                  placeholder="Type a command or search…"
                  displayValue={() => ''}
                  onChange={e => setQuery(e.target.value)}
                />
              </div>
              <ComboboxOptions static className="max-h-[50vh] overflow-y-auto p-2">
                {groups.length === 0 && (
                  <p className="px-3 py-6 text-center text-[13px]" style={{ color: 'var(--text3)' }}>No results</p>
                )}
                {groups.map(([group, groupActions]) => (
                  <div key={group} className="mb-1">
                    <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text3)' }}>{group}</p>
                    {groupActions.map(action => (
                      <ComboboxOption key={action.id} value={action} className="cursor-pointer rounded-lg px-3 py-2 text-[13px] data-[focus]:bg-[var(--bg3)]" style={{ color: 'var(--text)' }}>
                        {action.label}
                      </ComboboxOption>
                    ))}
                  </div>
                ))}
              </ComboboxOptions>
            </Combobox>
          </DialogPanel>
        </div>
      </Dialog>

      <SpaceFormDialog open={spaceDialog} onClose={() => setSpaceDialog(false)} onSaved={refresh} />
      <MilestoneFormDialog open={milestoneDialog} onClose={() => setMilestoneDialog(false)} onSaved={() => router.push('/roadmap')} />
      <TaskCreateDialog
        open={taskDialog}
        statuses={statuses}
        onClose={() => setTaskDialog(false)}
        onCreated={() => router.push('/tasks')}
      />
    </>
  )
}
