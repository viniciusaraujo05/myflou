export default function InboxPage() {
  return (
    <div className="app-page flex-1 overflow-y-auto fade-in">
      <div className="app-page-header">
        <h1 className="app-page-title font-serif text-[34px] font-medium" style={{ color: 'var(--text)' }}>
          Inbox
        </h1>
      </div>
      <div
        className="flex flex-col items-start gap-2 rounded-2xl p-6"
        style={{ background: 'var(--bg2)', boxShadow: 'var(--shadow)' }}
      >
        <p className="text-[14px] font-medium" style={{ color: 'var(--text)' }}>
          Your universal collection point
        </p>
        <p className="max-w-md text-[13px] leading-relaxed" style={{ color: 'var(--text2)' }}>
          Capture anything — ideas, links, reminders — and let AI suggest the right Space and
          resource type before you save. Full triage flow is coming in the next phase; for now use
          the capture button to classify and save items.
        </p>
      </div>
    </div>
  )
}
