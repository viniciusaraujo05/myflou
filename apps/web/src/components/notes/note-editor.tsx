'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import Placeholder from '@tiptap/extension-placeholder'
import { useState, useEffect, useRef } from 'react'
import type { Note, Folder } from '@flou/shared'
import { coreExtensions } from '@/lib/editor-extensions'
import { printNotes } from '@/lib/print-note'
import './note-editor.css'

interface NoteEditorProps {
  note: Note
  folders: Folder[]
  onChange: (noteId: string, title: string, content: unknown) => void
  onDelete: (id: string) => void
  onFolderChange: (folderId: string | null) => void
}

export function NoteEditor({ note, folders, onChange, onDelete, onFolderChange }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title)
  const [showFolderMenu, setShowFolderMenu] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const currentFolder = folders.find(f => f.id === note.folderId)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      ...coreExtensions,
      Placeholder.configure({ placeholder: 'Start writing…' }),
    ],
    content: (note.content as object) || '',
    onUpdate: ({ editor }) => {
      onChange(note.id, title, editor.getJSON())
    },
  })

  useEffect(() => {
    setTitle(note.title)
  }, [note.id, note.title])

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value)
    onChange(note.id, e.target.value, editor?.getJSON())
  }

  function handleTitleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      editor?.commands.focus('start')
    }
  }

  function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !editor) return
    const reader = new FileReader()
    reader.onload = () => {
      editor.chain().focus().setImage({ src: reader.result as string, alt: file.name }).run()
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function handleExportPdf() {
    if (!editor) return
    printNotes([{ title, html: editor.getHTML() }])
  }

  if (!editor) return null

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Hidden image file input */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageFile}
      />

      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 2, padding: '10px 24px',
        borderBottom: '1px solid var(--divider)', flexWrap: 'wrap',
        background: 'var(--bg2)',
      }}>
        <ToolbarGroup>
          <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold (⌘B)">
            <b>B</b>
          </ToolBtn>
          <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic (⌘I)">
            <i>I</i>
          </ToolBtn>
          <ToolBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
            <u>U</u>
          </ToolBtn>
          <ToolBtn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
            <s>S</s>
          </ToolBtn>
        </ToolbarGroup>

        <Divider />

        <ToolbarGroup>
          <ToolBtn active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">H1</ToolBtn>
          <ToolBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">H2</ToolBtn>
          <ToolBtn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">H3</ToolBtn>
        </ToolbarGroup>

        <Divider />

        <ToolbarGroup>
          <ToolBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">• —</ToolBtn>
          <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered list">1.</ToolBtn>
          <ToolBtn active={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()} title="Task list">☐</ToolBtn>
        </ToolbarGroup>

        <Divider />

        <ToolbarGroup>
          <ToolBtn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote">"</ToolBtn>
          <ToolBtn active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} title="Inline code">`</ToolBtn>
          <ToolBtn active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code block">{'{ }'}</ToolBtn>
        </ToolbarGroup>

        <Divider />

        <ToolbarGroup>
          <ToolBtn active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()} title="Highlight">
            <span style={{ background: '#fef08a', borderRadius: 2, padding: '0 3px', fontSize: 11 }}>HL</span>
          </ToolBtn>
          <ToolBtn active={false} onClick={() => imageInputRef.current?.click()} title="Insert image">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </ToolBtn>
        </ToolbarGroup>

        {/* Image resize controls — visible only when an image is selected */}
        {editor.isActive('image') && (() => {
          const currentWidth = editor.getAttributes('image').width as string ?? '100%'
          return (
            <>
              <Divider />
              <ToolbarGroup>
                {(['25%', '50%', '75%', '100%'] as const).map(w => (
                  <ToolBtn
                    key={w}
                    active={currentWidth === w}
                    onClick={() => editor.chain().focus().updateAttributes('image', { width: w }).run()}
                    title={`Image width ${w}`}
                  >
                    {w}
                  </ToolBtn>
                ))}
              </ToolbarGroup>
            </>
          )
        })()}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Export PDF */}
        <button
          onClick={handleExportPdf}
          title="Export to PDF"
          style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 7, cursor: 'pointer',
            border: '1px solid var(--divider)', background: 'transparent', fontSize: 12, color: 'var(--text2)',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          PDF
        </button>

        {/* Folder selector */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowFolderMenu(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 7, cursor: 'pointer',
              border: '1px solid var(--divider)', background: 'transparent', fontSize: 12, color: 'var(--text2)',
            }}
          >
            {currentFolder && <span style={{ width: 8, height: 8, borderRadius: '50%', background: currentFolder.color }} />}
            {currentFolder ? currentFolder.name : 'No folder'}
            <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor"><path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
          </button>
          {showFolderMenu && (
            <div style={{
              position: 'absolute', right: 0, top: '100%', marginTop: 4, zIndex: 50,
              background: 'var(--bg)', border: '1px solid var(--divider)', borderRadius: 10,
              boxShadow: 'var(--shadow)', minWidth: 160, padding: 4,
            }}>
              <FolderOption label="No folder" color={null} active={note.folderId === null}
                onClick={() => { onFolderChange(null); setShowFolderMenu(false) }} />
              {folders.map(f => (
                <FolderOption key={f.id} label={f.name} color={f.color} active={note.folderId === f.id}
                  onClick={() => { onFolderChange(f.id); setShowFolderMenu(false) }} />
              ))}
            </div>
          )}
        </div>

        {/* Delete */}
        <button
          onClick={async () => { if (confirm('Delete this note?')) { setDeleting(true); await onDelete(note.id) } }}
          disabled={deleting}
          style={{
            padding: '4px 10px', borderRadius: 7, fontSize: 12, cursor: 'pointer',
            border: '1px solid var(--divider)', color: '#dc2626', background: 'transparent', opacity: deleting ? 0.5 : 1,
          }}
        >
          {deleting ? '…' : 'Delete'}
        </button>
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            onKeyDown={handleTitleKeyDown}
            placeholder="Untitled"
            style={{
              width: '100%', fontSize: 30, fontWeight: 700, letterSpacing: '-0.5px',
              border: 'none', outline: 'none', background: 'transparent',
              color: 'var(--text)', marginBottom: 24, lineHeight: 1.2,
              fontFamily: 'var(--font-serif, Georgia, serif)',
            }}
          />
          {/* Tiptap editor */}
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>{children}</div>
}

function Divider() {
  return <div style={{ width: 1, height: 18, background: 'var(--divider)', margin: '0 4px', flexShrink: 0 }} />
}

function ToolBtn({ active, onClick, title, children }: {
  active: boolean; onClick: () => void; title?: string; children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        minWidth: 28, height: 26, padding: '0 6px', borderRadius: 5, cursor: 'pointer',
        border: 'none', fontSize: 12, fontWeight: 600,
        background: active ? 'var(--accent-bg)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--text2)',
      }}
    >
      {children}
    </button>
  )
}

function FolderOption({ label, color, active, onClick }: { label: string; color: string | null; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 7,
        cursor: 'pointer', border: 'none', background: active ? 'var(--bg3)' : 'transparent',
        color: 'var(--text)', fontSize: 13,
      }}
    >
      {color ? <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} /> : <span style={{ width: 8 }} />}
      {label}
    </button>
  )
}
