const PRINT_STYLES = `
  * { box-sizing: border-box; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 15px;
    line-height: 1.75;
    color: #111;
    max-width: 720px;
    margin: 0 auto;
    padding: 48px 40px;
  }
  h1.note-title {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 28px;
    letter-spacing: -0.5px;
  }
  .note-body h1 { font-size: 22px; font-weight: 700; margin: 24px 0 8px; }
  .note-body h2 { font-size: 18px; font-weight: 600; margin: 20px 0 6px; }
  .note-body h3 { font-size: 15px; font-weight: 600; margin: 16px 0 4px; }
  .note-body p { margin: 0 0 8px; }
  .note-body ul, .note-body ol { padding-left: 22px; margin: 6px 0; }
  .note-body li { margin: 2px 0; }
  .note-body blockquote {
    border-left: 3px solid #ccc;
    padding: 4px 0 4px 16px;
    margin: 12px 0;
    color: #555;
    font-style: italic;
  }
  .note-body code {
    background: #f3f4f6;
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 0.87em;
    font-family: 'Courier New', monospace;
  }
  .note-body pre {
    background: #f3f4f6;
    padding: 14px 16px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 12px 0;
  }
  .note-body pre code { background: none; }
  .note-body mark { background: #fef08a; border-radius: 2px; padding: 0 2px; }
  .note-body img { max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0; display: block; }
  .note-body a { color: #6c63ff; }
  .note-body hr { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
  .note-body ul[data-type="taskList"] { list-style: none; padding: 0; }
  .note-body ul[data-type="taskList"] > li { display: flex; align-items: flex-start; gap: 8px; }
  .note-body ul[data-type="taskList"] > li > label { flex-shrink: 0; margin-top: 3px; }
  .note-body ul[data-type="taskList"] > li[data-checked="true"] > div { text-decoration: line-through; color: #888; }
  .page-break { page-break-after: always; border: none; margin: 0; padding: 0; height: 0; }
  @media print {
    body { padding: 20px; }
    .page-break { page-break-after: always; }
  }
`

export interface PrintableNote {
  title: string
  html: string
}

export function printNotes(notes: PrintableNote[], docTitle?: string) {
  const body = notes
    .map((note, i) => `
        <article>
          <h1 class="note-title">${escHtml(note.title || 'Untitled')}</h1>
          <div class="note-body">${note.html}</div>
        </article>
        ${i < notes.length - 1 ? '<div class="page-break"></div>' : ''}
      `)
    .join('')

  const doc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escHtml(docTitle || notes[0]?.title || 'Note')}</title>
  <style>${PRINT_STYLES}</style>
</head>
<body>
  ${body}
  <script>
    window.onload = function () {
      window.print();
      window.onafterprint = function () { window.close(); };
    };
  <\/script>
</body>
</html>`

  const win = window.open('', '_blank')
  if (win) {
    win.document.write(doc)
    win.document.close()
  }
}

function escHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
