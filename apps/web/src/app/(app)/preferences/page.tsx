'use client'

import { useTheme } from '@/components/theme/theme-provider'

export default function PreferencesPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="app-page flex-1 overflow-y-auto fade-in">
      <div className="app-page-header">
        <h1 className="app-page-title font-serif text-[34px] font-medium" style={{ color: 'var(--text)' }}>
          Preferences
        </h1>
      </div>

      <div className="rounded-2xl p-5" style={{ background: 'var(--bg2)', boxShadow: 'var(--shadow)' }}>
        <p className="mb-3 text-[14px] font-medium" style={{ color: 'var(--text)' }}>Appearance</p>
        <div className="flex gap-2">
          {(['light', 'dark'] as const).map(option => (
            <button
              key={option}
              onClick={() => setTheme(option)}
              className="flex-1 rounded-xl px-4 py-3 text-[13px] font-medium capitalize transition-colors"
              style={{
                background: theme === option ? 'var(--bg3)' : 'var(--bg)',
                color: theme === option ? 'var(--text)' : 'var(--text2)',
                border: theme === option ? '1px solid var(--accent)' : '1px solid var(--divider)',
              }}
            >
              {option} mode
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
