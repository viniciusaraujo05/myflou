import type { OpenAIService } from '../../infrastructure/ai/openai.service.js'
import type { INotRepository } from '../../domain/note/note.repository.js'
import type { ITaskRepository } from '../../domain/task/task.repository.js'
import type { ILinkRepository } from '../../domain/link/link.repository.js'
import type { IFolderRepository } from '../../domain/folder/folder.repository.js'
import type { ILinkCategoryRepository } from '../../domain/link-category/link-category.repository.js'
import type { ICredentialRepository } from '../../domain/credential/credential.repository.js'

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

    const items = await this.ai.classify(text, {
      today,
      folders: folders.map(f => ({ id: f.id, name: f.name })),
      recentNotes: recentNotes.slice(0, 20).map(n => ({ id: n.id, title: n.title })),
      categories: categories.map(c => ({ id: c.id, name: c.name })),
    })

    const created: SavedItem[] = []

    for (const item of items) {
      try {
        if (item.type === 'note') {
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
