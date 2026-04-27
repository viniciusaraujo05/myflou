'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Link, LinkCategory } from '@flou/shared'
import { apiFetch } from '@/lib/auth'
import { LinkFormDialog } from '@/components/links/link-form-dialog'
import { CategoryDialog } from '@/components/links/category-dialog'

const PRESET_COLORS = ['#6b7280','#3b82f6','#8b5cf6','#ec4899','#f59e0b','#10b981','#ef4444','#14b8a6']

function getDomain(url: string) {
  try { return new URL(url).hostname.replace('www.', '') } catch { return url }
}

export default function LinksPage() {
  const [categories, setCategories] = useState<LinkCategory[]>([])
  const [links, setLinks] = useState<Link[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [linkDialog, setLinkDialog] = useState<{ open: boolean; link?: Link }>({ open: false })
  const [categoryDialog, setCategoryDialog] = useState<{ open: boolean; category?: LinkCategory }>({ open: false })

  const loadCategories = useCallback(async () => {
    const res = await apiFetch('/api/link-categories')
    if (res.ok) setCategories(await res.json())
  }, [])

  const loadLinks = useCallback(async () => {
    const qs = selectedCategoryId ? `?categoryId=${selectedCategoryId}` : ''
    const res = await apiFetch(`/api/links${qs}`)
    if (res.ok) setLinks(await res.json())
  }, [selectedCategoryId])

  useEffect(() => { loadCategories() }, [loadCategories])
  useEffect(() => { loadLinks() }, [loadLinks])

  async function saveLink(data: {
    title: string; url: string; description: string | null
    categoryId: string | null; username: string | null; password: string | null
  }, id?: string) {
    if (id) {
      await apiFetch(`/api/links/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } else {
      await apiFetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    }
    setLinkDialog({ open: false })
    await loadLinks()
  }

  async function deleteLink(id: string) {
    await apiFetch(`/api/links/${id}`, { method: 'DELETE' })
    setLinkDialog({ open: false })
    await loadLinks()
  }

  async function saveCategory(name: string, color: string, id?: string) {
    if (id) {
      await apiFetch(`/api/link-categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color }),
      })
    } else {
      await apiFetch('/api/link-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color }),
      })
    }
    await loadCategories()
    setCategoryDialog({ open: false })
  }

  async function deleteCategory(id: string) {
    await apiFetch(`/api/link-categories/${id}`, { method: 'DELETE' })
    if (selectedCategoryId === id) setSelectedCategoryId(null)
    await loadCategories()
    await loadLinks()
    setCategoryDialog({ open: false })
  }

  const activeCategory = categories.find(c => c.id === selectedCategoryId)

  return (
    <main className="flex flex-1 flex-col overflow-y-auto" style={{ padding: '32px 36px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>
            Links
          </div>
          <h2 className="font-serif" style={{ fontSize: 28, fontWeight: 400, letterSpacing: '-0.5px', margin: 0 }}>
            Saved links
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setCategoryDialog({ open: true })}
            style={{
              padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 500,
              border: '1px solid var(--divider)', color: 'var(--text2)',
              background: 'transparent', cursor: 'pointer',
            }}
          >
            + Category
          </button>
          <button
            onClick={() => setLinkDialog({ open: true })}
            style={{
              padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 500,
              background: 'var(--accent)', color: '#fff', cursor: 'pointer',
            }}
          >
            + Add link
          </button>
        </div>
      </div>

      {/* Category filter pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24, alignItems: 'center' }}>
        <button
          onClick={() => setSelectedCategoryId(null)}
          style={{
            padding: '5px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
            background: selectedCategoryId === null ? 'var(--accent)' : 'var(--bg2)',
            color: selectedCategoryId === null ? '#fff' : 'var(--text2)',
            border: '1px solid var(--divider)', fontWeight: 500,
          }}
        >
          All
        </button>
        {categories.map(cat => (
          <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <button
              onClick={() => setSelectedCategoryId(cat.id === selectedCategoryId ? null : cat.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                background: selectedCategoryId === cat.id ? cat.color + '22' : 'var(--bg2)',
                color: selectedCategoryId === cat.id ? cat.color : 'var(--text2)',
                border: `1px solid ${selectedCategoryId === cat.id ? cat.color : 'var(--divider)'}`,
                fontWeight: selectedCategoryId === cat.id ? 600 : 400,
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
              {cat.name}
            </button>
            <button
              onClick={() => setCategoryDialog({ open: true, category: cat })}
              style={{ padding: '3px 5px', borderRadius: 5, fontSize: 11, color: 'var(--text3)', cursor: 'pointer', background: 'transparent', border: 'none' }}
              title="Edit category"
            >✎</button>
          </div>
        ))}
      </div>

      {/* Links grid */}
      {links.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '60px 0' }}>
          <div style={{ fontSize: 36 }}>🔗</div>
          <p style={{ fontSize: 14, color: 'var(--text3)' }}>
            {selectedCategoryId ? `No links in "${activeCategory?.name}"` : 'No links saved yet'}
          </p>
          <button
            onClick={() => setLinkDialog({ open: true })}
            style={{
              padding: '8px 20px', borderRadius: 10, fontSize: 13, fontWeight: 500,
              background: 'var(--accent)', color: '#fff', cursor: 'pointer',
            }}
          >
            Add your first link
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {links.map(link => {
            const cat = categories.find(c => c.id === link.categoryId)
            const domain = getDomain(link.url)
            const initial = (link.title.charAt(0) || domain.charAt(0) || '?').toUpperCase()
            const bgColor = cat ? cat.color + '18' : 'var(--bg2)'
            const accentColor = cat ? cat.color : 'var(--text3)'

            return (
              <div
                key={link.id}
                style={{
                  padding: '14px 16px', borderRadius: 14,
                  background: bgColor,
                  border: `1px solid ${cat ? cat.color + '33' : 'var(--divider)'}`,
                  boxShadow: 'var(--shadow)',
                  display: 'flex', flexDirection: 'column', gap: 8,
                }}
              >
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  {/* Favicon / initial */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                    background: cat ? cat.color + '33' : 'var(--bg3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15, fontWeight: 700, color: accentColor,
                  }}>
                    {initial}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {link.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {domain}
                    </div>
                  </div>
                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '4px 8px', borderRadius: 7, fontSize: 11, fontWeight: 500,
                        background: 'var(--bg)', border: '1px solid var(--divider)',
                        color: 'var(--text2)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
                      }}
                      title="Open link"
                    >
                      ↗
                    </a>
                    <button
                      onClick={() => setLinkDialog({ open: true, link })}
                      style={{
                        padding: '4px 7px', borderRadius: 7, fontSize: 11,
                        background: 'var(--bg)', border: '1px solid var(--divider)',
                        color: 'var(--text2)', cursor: 'pointer',
                      }}
                      title="Edit"
                    >
                      ✎
                    </button>
                  </div>
                </div>

                {/* Description */}
                {link.description && (
                  <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5, margin: 0 }}>
                    {link.description}
                  </p>
                )}

                {/* Category + credentials */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {cat && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: 10, padding: '2px 8px', borderRadius: 10,
                      background: cat.color + '22', color: cat.color, fontWeight: 500,
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cat.color }} />
                      {cat.name}
                    </span>
                  )}
                  {link.username && (
                    <span style={{ fontSize: 10, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <span>👤</span> {link.username}
                    </span>
                  )}
                  {link.password && (
                    <span style={{ fontSize: 10, color: 'var(--text3)' }}>🔑 ••••••</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Dialogs */}
      {linkDialog.open && (
        <LinkFormDialog
          link={linkDialog.link}
          categories={categories}
          defaultCategoryId={selectedCategoryId}
          onSave={saveLink}
          onDelete={deleteLink}
          onClose={() => setLinkDialog({ open: false })}
        />
      )}
      {categoryDialog.open && (
        <CategoryDialog
          category={categoryDialog.category}
          presetColors={PRESET_COLORS}
          onSave={saveCategory}
          onDelete={deleteCategory}
          onClose={() => setCategoryDialog({ open: false })}
        />
      )}
    </main>
  )
}
