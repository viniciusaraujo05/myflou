'use client'

import { useState } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import type { Folder } from '@flou/shared'

interface FolderDialogProps {
  folder?: Folder
  presetColors: string[]
  onSave: (name: string, color: string, id?: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onClose: () => void
}

export function FolderDialog({ folder, presetColors, onSave, onDelete, onClose }: FolderDialogProps) {
  const [name, setName] = useState(folder?.name ?? '')
  const [color, setColor] = useState(folder?.color ?? presetColors[0]!)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setSaving(true)
    try { await onSave(trimmed, color, folder?.id) } finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!folder) return
    if (!confirm(`Delete folder "${folder.name}"? Notes inside will become unfiled.`)) return
    setDeleting(true)
    try { await onDelete(folder.id) } finally { setDeleting(false) }
  }

  return (
    <Dialog open onClose={onClose} className="relative z-50">
      <div className="fixed inset-0" style={{ background: 'rgba(28,24,20,0.3)', backdropFilter: 'blur(2px)' }} aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          className="w-full max-w-sm rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg)', boxShadow: 'var(--shadow)', border: '1px solid var(--divider)' }}
        >
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--divider)', background: 'var(--bg2)' }}>
            <DialogTitle style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
              {folder ? 'Edit folder' : 'New folder'}
            </DialogTitle>
          </div>

          <form onSubmit={handleSave}>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>
                  Name
                </label>
                <input
                  autoFocus
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={60}
                  placeholder="Folder name"
                  style={{
                    width: '100%', fontSize: 14, padding: '8px 12px', borderRadius: 8,
                    border: '1.5px solid var(--divider)', background: 'var(--bg2)',
                    color: 'var(--text)', outline: 'none', boxSizing: 'border-box',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--divider)')}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 8 }}>
                  Color
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {presetColors.map(c => (
                    <button
                      key={c} type="button"
                      onClick={() => setColor(c)}
                      style={{
                        width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer',
                        border: `2.5px solid ${color === c ? 'var(--text)' : 'transparent'}`,
                        outline: color === c ? '2px solid var(--bg)' : 'none',
                        outlineOffset: -3,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--divider)', display: 'flex', gap: 8 }}>
              {folder && (
                <button
                  type="button" onClick={handleDelete} disabled={deleting}
                  style={{
                    padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                    border: '1px solid var(--divider)', color: '#dc2626',
                    background: 'transparent', cursor: 'pointer', opacity: deleting ? 0.5 : 1,
                  }}
                >
                  {deleting ? '…' : 'Delete'}
                </button>
              )}
              <div style={{ flex: 1 }} />
              <button
                type="button" onClick={onClose}
                style={{
                  padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                  border: '1px solid var(--divider)', color: 'var(--text2)',
                  background: 'transparent', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit" disabled={saving || !name.trim()}
                style={{
                  padding: '7px 18px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                  background: 'var(--accent)', color: '#fff', cursor: 'pointer',
                  opacity: saving || !name.trim() ? 0.6 : 1,
                }}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
