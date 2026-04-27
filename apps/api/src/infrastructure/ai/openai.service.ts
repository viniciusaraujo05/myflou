import OpenAI from 'openai'

export type ClassifiedItem =
  | { type: 'note'; title: string; content: string; folderId: string | null }
  | { type: 'task'; title: string; date: string; description: string | null }
  | { type: 'link'; url: string; title: string; description: string | null; categoryId: string | null; username: string | null; password: string | null }
  | { type: 'credential'; service: string; username: string; password: string; url: string | null; notes: string | null }

interface ClassifyContext {
  today: string
  folders: { id: string; name: string }[]
  recentNotes: { id: string; title: string }[]
  categories: { id: string; name: string }[]
}

export class OpenAIService {
  private client: OpenAI
  private model: string

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error('OPENAI_API_KEY is not configured')
    this.client = new OpenAI({ apiKey })
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
  }

  async classify(text: string, ctx: ClassifyContext): Promise<ClassifiedItem[]> {
    const foldersStr = ctx.folders.length
      ? ctx.folders.map(f => `  id="${f.id}" name="${f.name}"`).join('\n')
      : '  (no folders yet)'

    const notesStr = ctx.recentNotes.length
      ? ctx.recentNotes.slice(0, 20).map(n => `  id="${n.id}" title="${n.title}"`).join('\n')
      : '  (no notes yet)'

    const categoriesStr = ctx.categories.length
      ? ctx.categories.map(c => `  id="${c.id}" name="${c.name}"`).join('\n')
      : '  (no categories yet)'

    const system = `You are an intelligent content organizer for a personal productivity app.
Today's date: ${ctx.today}

User's note folders:
${foldersStr}

User's recent notes (for context on routing):
${notesStr}

User's link categories:
${categoriesStr}

Analyze the input and extract every identifiable item. Return ONLY a JSON object:
{
  "items": [
    { "type": "note",  "title": "...", "content": "...", "folderId": "<id from list above or null>" },
    { "type": "task",  "title": "...", "date": "YYYY-MM-DD", "description": "..." or null },
    { "type": "link",  "url": "https://...", "title": "...", "description": "..." or null, "categoryId": "<id or null>", "username": "..." or null, "password": "..." or null },
    { "type": "credential", "service": "Gmail", "username": "user@email.com", "password": "...", "url": "..." or null, "notes": "..." or null }
  ]
}

Rules:
- Extract ALL distinct items — mix of notes, tasks, links, credentials is valid
- Tasks: use today (${ctx.today}) when no date given; resolve relative dates to YYYY-MM-DD
- Notes: suggest folderId only from the provided IDs; pick the most thematically matching folder, or null
- Links (type="link"): use when a URL is the primary item being saved (bookmarking a page). If the link also has username/password, put them in the link item
- Credentials (type="credential"): use when saving login info for a service, even without a URL, e.g. "my Gmail: user@email.com / abc123", "AWS key: access_id / secret". If there IS a URL for credentials, include it as url field
- If a URL + credentials are given and the intent is to bookmark the page: use "link". If the intent is to store the login: use "credential"
- Suggest categoryId for links from the provided list; do NOT invent IDs
- Do NOT invent folder or category IDs — only use exact IDs from the lists above
- If nothing can be classified, return {"items":[]}`

    const res = await this.client.chat.completions.create({
      model: this.model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: text },
      ],
      max_tokens: 2048,
      temperature: 0.2,
    })

    const raw = res.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(raw) as { items?: unknown[] }
    return Array.isArray(parsed.items) ? (parsed.items as ClassifiedItem[]) : []
  }
}
