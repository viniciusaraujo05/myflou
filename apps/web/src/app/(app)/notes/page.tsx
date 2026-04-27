'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { generateHTML } from '@tiptap/react'
import type { Folder, NoteSummary, Note } from '@flou/shared'
import { apiFetch } from '@/lib/auth'
import { NoteEditor } from '@/components/notes/note-editor'
import { FolderDialog } from '@/components/notes/folder-dialog'
import { coreExtensions } from '@/lib/editor-extensions'
import { printNotes } from '@/lib/print-note'

const PRESET_COLORS = ['#6b7280','#3b82f6','#8b5cf6','#ec4899','#f59e0b','#10b981','#ef4444','#14b8a6']

export default function NotesPage() {
  const [folders, setFolders] = useState<Folder[]>([])
  const [notes, setNotes] = useState<NoteSummary[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [search, setSearch] = useState('')
  const [folderDialog, setFolderDialog] = useState<{ open: boolean; folder?: Folder }>({ open: false })
  const [creating, setCreating] = useState(false)
  const [exportingFolder, setExportingFolder] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadFolders = useCallback(async () => {
    const res = await apiFetch('/api/folders')
    if (res.ok) setFolders(await res.json())
  }, [])

  const loadNotes = useCallback(async () => {
    const qs = new URLSearchParams()
    if (selectedFolderId) qs.set('folderId', selectedFolderId)
    if (search) qs.set('search', search)
    const res = await apiFetch(`/api/notes?${qs}`)
    if (res.ok) setNotes(await res.json())
  }, [selectedFolderId, search])

  useEffect(() => { loadFolders() }, [loadFolders])
  useEffect(() => { loadNotes() }, [loadNotes])

  async function openNote(summary: NoteSummary) {
    const res = await apiFetch(`/api/notes/${summary.id}`)
    if (res.ok) setSelectedNote(await res.json())
  }

  async function createNote() {
    setCreating(true)
    try {
      const res = await apiFetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled', folderId: selectedFolderId }),
      })
      if (res.ok) {
        const note: Note = await res.json()
        setSelectedNote(note)
        await loadNotes()
      }
    } finally {
      setCreating(false)
    }
  }

  function handleContentChange(noteId: string, title: string, content: unknown) {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      await apiFetch(`/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })
      await loadNotes()
    }, 800)
  }

  async function deleteNote(id: string) {
    await apiFetch(`/api/notes/${id}`, { method: 'DELETE' })
    setSelectedNote(null)
    await loadNotes()
  }

  async function saveFolder(name: string, color: string, id?: string) {
    if (id) {
      await apiFetch(`/api/folders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color }),
      })
    } else {
      await apiFetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color }),
      })
    }
    await loadFolders()
    setFolderDialog({ open: false })
  }

  async function deleteFolder(id: string) {
    await apiFetch(`/api/folders/${id}`, { method: 'DELETE' })
    if (selectedFolderId === id) setSelectedFolderId(null)
    await loadFolders()
    await loadNotes()
    setFolderDialog({ open: false })
  }

  async function exportFolderToPdf() {
    const folder = folders.find(f => f.id === selectedFolderId)
    const targetNotes = selectedFolderId ? notes.filter(n => n.folderId === selectedFolderId) : notes
    if (targetNotes.length === 0) return
    setExportingFolder(true)
    try {
      const full = await Promise.all(
        targetNotes.map(n => apiFetch(`/api/notes/${n.id}`).then(r => r.json() as Promise<Note>))
      )
      const printable = full.map(n => ({
        title: n.title || 'Untitled',
        html: n.content ? generateHTML(n.content as Parameters<typeof generateHTML>[0], coreExtensions) : '',
      }))
      printNotes(printable, folder ? folder.name : 'All notes')
    } finally {
      setExportingFolder(false)
    }
  }

  const filteredNotes = search
    ? notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()))
    : notes

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      <aside style={{ width: 240, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--divider)', background: 'var(--bg2)', flexShrink: 0 }}>
        {/* Search */}
        <div style={{ padding: '16px 14px 10px' }}>
          <input
            type="text"
            placeholder="Search notes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', fontSize: 12, padding: '7px 10px', borderRadius: 8,
              border: '1.5px solid var(--divider)', background: 'var(--bg)',
              color: 'var(--text)', outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={e => (e.target.style.borderColor = 'var(--divider)')}
          />
        </div>

        {/* Folders */}
        <div style={{ padding: '0 14px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', color: 'var(--text3)', textTransform: 'uppercase' }}>Folders</span>
            <button
              onClick={() => setFolderDialog({ open: true })}
              style={{ fontSize: 16, color: 'var(--text3)', cursor: 'pointer', lineHeight: 1, padding: 2 }}
              title="New folder"
            >+</button>
          </div>

          {/* All notes */}
          <button
            onClick={() => { setSelectedFolderId(null); setSearch('') }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 7, cursor: 'pointer', marginBottom: 2,
              background: selectedFolderId === null && !search ? 'var(--bg3)' : 'transparent',
              border: 'none', color: selectedFolderId === null && !search ? 'var(--text)' : 'var(--text2)', fontSize: 13, fontWeight: 500,
            }}
          >
            <span style={{ fontSize: 14 }}>📄</span> All notes
          </button>

          {folders.map(folder => (
            <div key={folder.id} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
              <button
                onClick={() => { setSelectedFolderId(folder.id); setSearch('') }}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 7, cursor: 'pointer',
                  background: selectedFolderId === folder.id ? 'var(--bg3)' : 'transparent',
                  border: 'none', color: selectedFolderId === folder.id ? 'var(--text)' : 'var(--text2)', fontSize: 13,
                }}
              >
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: folder.color, flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'left' }}>{folder.name}</span>
              </button>
              <button
                onClick={() => setFolderDialog({ open: true, folder })}
                style={{ padding: '4px 5px', borderRadius: 5, fontSize: 11, color: 'var(--text3)', cursor: 'pointer', background: 'transparent', border: 'none', opacity: 0.6 }}
                title="Edit folder"
              >✎</button>
            </div>
          ))}
        </div>

        {/* Notes list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 4px 8px' }}>
            <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', color: 'var(--text3)', textTransform: 'uppercase' }}>Notes</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {notes.length > 0 && (
                <button
                  onClick={exportFolderToPdf}
                  disabled={exportingFolder}
                  title={selectedFolderId ? 'Export folder to PDF' : 'Export all notes to PDF'}
                  style={{ fontSize: 11, color: 'var(--text3)', cursor: 'pointer', padding: '2px 5px', opacity: exportingFolder ? 0.5 : 1, background: 'none', border: 'none' }}
                >
                  {exportingFolder ? '…' : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="12" y1="18" x2="12" y2="12" />
                      <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                  )}
                </button>
              )}
              <button
                onClick={createNote}
                disabled={creating}
                style={{ fontSize: 16, color: 'var(--accent)', cursor: 'pointer', lineHeight: 1, padding: 2, opacity: creating ? 0.5 : 1, background: 'none', border: 'none' }}
                title="New note"
              >+</button>
            </div>
          </div>

          {filteredNotes.length === 0 && (
            <div style={{ padding: '20px 8px', textAlign: 'center', fontSize: 12, color: 'var(--text3)' }}>
              {search ? 'No results' : 'No notes yet'}
            </div>
          )}

          {filteredNotes.map(note => {
            const folder = folders.find(f => f.id === note.folderId)
            const isSelected = selectedNote?.id === note.id
            return (
              <button
                key={note.id}
                onClick={() => openNote(note)}
                style={{
                  width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 2,
                  background: isSelected ? 'var(--accent-bg)' : 'transparent',
                  border: `1.5px solid ${isSelected ? 'var(--accent)' : 'transparent'}`,
                  color: 'var(--text)',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                  {note.title || 'Untitled'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {folder && <span style={{ width: 6, height: 6, borderRadius: '50%', background: folder.color, flexShrink: 0, display: 'inline-block' }} />}
                  <span style={{ fontSize: 10, color: 'var(--text3)' }}>
                    {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </aside>

      {/* Editor */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedNote ? (
          <NoteEditor
            key={selectedNote.id}
            note={selectedNote}
            folders={folders}
            onChange={handleContentChange}
            onDelete={deleteNote}
            onFolderChange={async (folderId) => {
              await apiFetch(`/api/notes/${selectedNote.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ folderId }),
              })
              setSelectedNote(prev => prev ? { ...prev, folderId } : prev)
              await loadNotes()
            }}
          />
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ fontSize: 36 }}>📝</div>
            <p style={{ fontSize: 14, color: 'var(--text3)' }}>Select a note or create a new one</p>
            <button
              onClick={createNote}
              disabled={creating}
              style={{
                padding: '8px 20px', borderRadius: 10, fontSize: 13, fontWeight: 500,
                background: 'var(--accent)', color: '#fff', cursor: 'pointer', opacity: creating ? 0.6 : 1,
              }}
            >
              {creating ? 'Creating…' : 'New note'}
            </button>
          </div>
        )}
      </main>

      {/* Folder dialog */}
      {folderDialog.open && (
        <FolderDialog
          folder={folderDialog.folder}
          presetColors={PRESET_COLORS}
          onSave={saveFolder}
          onDelete={deleteFolder}
          onClose={() => setFolderDialog({ open: false })}
        />
      )}
    </div>
  )
}
