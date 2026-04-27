import type { OpenAIService } from '../../infrastructure/ai/openai.service.js'
import type { INotRepository } from '../../domain/note/note.repository.js'
import type { ITaskRepository } from '../../domain/task/task.repository.js'
import type { ILinkRepository } from '../../domain/link/link.repository.js'
import type { IFolderRepository } from '../../domain/folder/folder.repository.js'
import type { ILinkCategoryRepository } from '../../domain/link-category/link-category.repository.js'
import type { ICredentialRepository } from '../../domain/credential/credential.repository.js'
import type { ClassifiedItem } from '../../infrastructure/ai/openai.service.js'

export interface SavedItem {
  type: 'note' | 'task' | 'link' | 'credential'
  id: string
  title: string
  date?: string
  url?: string
}

export interface ClassifyResult {
  created: SavedItem[]
}

function textToTiptap(text: string) {
  const lines = text.split('\n')
  return {
    type: 'doc',
    content: lines.map(line => ({
      type: 'paragraph',
      content: line.trim() ? [{ type: 'text', text: line }] : [],
    })),
  }
}

interface ParsedCredential {
  type: 'credential'
  service: string
  username: string
  password: string
  url: string | null
  notes: string | null
}

const URL_REGEX = /https?:\/\/[^\s]+/i
const USER_LABEL_REGEX = /^(u|user|username|login|email|e-mail|id|account|conta|sgo)\s*(?:[:=-])\s*(.+)$/i
const PASSWORD_LABEL_REGEX = /^(p|pass|password|pwd|senha)\s*(?:[:=-])\s*(.+)$/i

function cleanLine(line: string): string {
  return line.trim().replace(/^[-*•]\s*/, '').trim()
}

function serviceFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    return host.split('.')[0] || host
  } catch {
    return url
  }
}

function looksLikeUsername(line: string): boolean {
  if (line.includes(' ')) return false
  if (line.length < 3 || line.length > 120) return false
  return /@|\.|_|-/.test(line) || /^[a-z0-9]+$/i.test(line)
}

function looksLikePassword(line: string): boolean {
  if (line.includes(' ')) return false
  if (line.length < 6 || line.length > 120) return false
  return /[A-Z]/.test(line) && /[a-z]/.test(line) && /[0-9]/.test(line)
}

function parseCredentialDump(text: string): ParsedCredential[] {
  const lines = text
    .split(/\r?\n/)
    .map(cleanLine)
    .filter(Boolean)

  const credentials: ParsedCredential[] = []
  let pendingUrl: string | null = null
  let service: string | null = null
  let username: string | null = null
  let password: string | null = null
  let notes: string[] = []

  const flush = () => {
    if (!password || (!username && !service && !pendingUrl)) return

    credentials.push({
      type: 'credential',
      service: service || (pendingUrl ? serviceFromUrl(pendingUrl) : 'Credential'),
      username: username ?? '',
      password,
      url: pendingUrl,
      notes: notes.length ? notes.join('\n') : null,
    })

    service = null
    username = null
    password = null
    notes = []
  }

  for (const line of lines) {
    const urlMatch = line.match(URL_REGEX)
    if (urlMatch) {
      flush()
      pendingUrl = urlMatch[0]!.replace(/[),.;]+$/, '')
      service = serviceFromUrl(pendingUrl)
      continue
    }

    const userMatch = line.match(USER_LABEL_REGEX)
    if (userMatch) {
      if (password) flush()
      username = userMatch[2]!.trim()
      continue
    }

    const passwordMatch = line.match(PASSWORD_LABEL_REGEX)
    if (passwordMatch) {
      password = passwordMatch[2]!.trim()
      flush()
      continue
    }

    if (!service) {
      service = line.replace(/:$/, '').trim()
      continue
    }

    if (!username && looksLikeUsername(line)) {
      username = line
      continue
    }

    if (!password && looksLikePassword(line)) {
      password = line
      flush()
      continue
    }

    notes.push(line)
  }

  flush()
  return credentials
}

function credentialKey(item: Pick<ParsedCredential, 'service' | 'username' | 'password' | 'url'>): string {
  return [
    item.service.trim().toLowerCase(),
    item.username.trim().toLowerCase(),
    item.password,
    item.url ?? '',
  ].join('|')
}

export class ClassifyAndSaveUseCase {
  constructor(
    private readonly ai: OpenAIService,
    private readonly noteRepo: INotRepository,
    private readonly taskRepo: ITaskRepository,
    private readonly linkRepo: ILinkRepository,
    private readonly folderRepo: IFolderRepository,
    private readonly linkCategoryRepo: ILinkCategoryRepository,
    private readonly credentialRepo: ICredentialRepository,
  ) {}

  async execute(userId: string, text: string): Promise<ClassifyResult> {
    // Build context from the user's existing data
    const [folders, recentNotes, categories] = await Promise.all([
      this.folderRepo.findByUser(userId),
      this.noteRepo.findByUser(userId),
      this.linkCategoryRepo.findByUser(userId),
    ])

    const today = new Date().toISOString().slice(0, 10)

    const aiItems = await this.ai.classify(text, {
      today,
      folders: folders.map(f => ({ id: f.id, name: f.name })),
      recentNotes: recentNotes.slice(0, 20).map(n => ({ id: n.id, title: n.title })),
      categories: categories.map(c => ({ id: c.id, name: c.name })),
    })
    const parsedCredentials = parseCredentialDump(text)
    const seenCredentials = new Set<string>()
    const items: ClassifiedItem[] = []

    for (const item of aiItems) {
      if (item.type === 'credential') {
        seenCredentials.add(credentialKey(item))
      }
      items.push(item)
    }

    for (const credential of parsedCredentials) {
      const key = credentialKey(credential)
      if (!seenCredentials.has(key)) {
        items.push(credential)
        seenCredentials.add(key)
      }
    }

    const created: SavedItem[] = []

    for (const item of items) {
      try {
        if (item.type === 'note') {
          if (item.folderId && !folders.some(f => f.id === item.folderId)) continue
          const note = await this.noteRepo.create(userId, item.title || 'Untitled', item.folderId ?? null)
          if (item.content) {
            await this.noteRepo.update(note.id, { content: textToTiptap(item.content) })
          }
          created.push({ type: 'note', id: note.id, title: item.title || 'Untitled' })
        } else if (item.type === 'task') {
          const date = new Date(`${item.date}T00:00:00.000Z`)
          const task = await this.taskRepo.create(userId, item.title, date, item.description ?? null)
          created.push({ type: 'task', id: task.id, title: item.title, date: item.date })
        } else if (item.type === 'link') {
          if (item.categoryId && !categories.some(c => c.id === item.categoryId)) continue
          const link = await this.linkRepo.create(userId, {
            title: item.title,
            url: item.url,
            description: item.description ?? null,
            username: item.username ?? null,
            password: item.password ?? null,
            categoryId: item.categoryId ?? null,
          })
          created.push({ type: 'link', id: link.id, title: item.title, url: item.url })
        } else if (item.type === 'credential') {
          const cred = await this.credentialRepo.create(userId, {
            service: item.service,
            username: item.username,
            password: item.password,
            url: item.url ?? null,
            notes: item.notes ?? null,
          })
          created.push({ type: 'credential', id: cred.id, title: item.service })
        }
      } catch {
        // Skip items that fail (e.g. invalid date) and continue
      }
    }

    return { created }
  }
}
