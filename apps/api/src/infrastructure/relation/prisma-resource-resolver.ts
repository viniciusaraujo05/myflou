import type { IResourceResolver, ResolvedResource, ResourceType } from '../../domain/relation/resource-resolver.js'
import type { ITaskRepository } from '../../domain/task/task.repository.js'
import type { INotRepository } from '../../domain/note/note.repository.js'
import type { ILinkRepository } from '../../domain/link/link.repository.js'
import type { ICredentialRepository } from '../../domain/credential/credential.repository.js'
import type { ITransactionRepository } from '../../domain/transaction/transaction.repository.js'
import type { ISubscriptionRepository } from '../../domain/subscription/subscription.repository.js'
import type { IMilestoneRepository } from '../../domain/milestone/milestone.repository.js'

/** Resolves any resource (type, id) to its owner + a human label, using the per-type repos. */
export class PrismaResourceResolver implements IResourceResolver {
  constructor(
    private readonly tasks: ITaskRepository,
    private readonly notes: INotRepository,
    private readonly links: ILinkRepository,
    private readonly credentials: ICredentialRepository,
    private readonly transactions: ITransactionRepository,
    private readonly subscriptions: ISubscriptionRepository,
    private readonly milestones: IMilestoneRepository,
  ) {}

  async resolve(type: ResourceType, id: string): Promise<ResolvedResource | null> {
    switch (type) {
      case 'TASK': {
        const t = await this.tasks.findById(id)
        return t ? { type, id, userId: t.userId, title: t.toDTO().title } : null
      }
      case 'NOTE': {
        const n = await this.notes.findById(id)
        return n ? { type, id, userId: n.userId, title: n.toDTO().title } : null
      }
      case 'LINK': {
        const l = await this.links.findById(id)
        return l ? { type, id, userId: l.userId, title: l.toDTO().title } : null
      }
      case 'CREDENTIAL': {
        const c = await this.credentials.findById(id)
        return c ? { type, id, userId: c.userId, title: c.toDTO().service } : null
      }
      case 'TRANSACTION': {
        const tx = await this.transactions.findById(id)
        if (!tx) return null
        const dto = tx.toDTO()
        return { type, id, userId: tx.userId, title: `${dto.category} · ${dto.amount}` }
      }
      case 'SUBSCRIPTION': {
        const s = await this.subscriptions.findById(id)
        return s ? { type, id, userId: s.userId, title: s.toDTO().name } : null
      }
      case 'MILESTONE': {
        const m = await this.milestones.findById(id)
        return m ? { type, id, userId: m.userId, title: m.toDTO().title } : null
      }
      default:
        return null
    }
  }
}
