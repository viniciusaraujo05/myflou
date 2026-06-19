import type { ResourceLink } from './resource-link.entity.js'
import type { ResourceType } from './resource-resolver.js'

export interface IResourceLinkRepository {
  create(userId: string, fromType: ResourceType, fromId: string, toType: ResourceType, toId: string): Promise<ResourceLink>
  /** Existing link between two endpoints in canonical order, if any. */
  findPair(userId: string, fromType: ResourceType, fromId: string, toType: ResourceType, toId: string): Promise<ResourceLink | null>
  /** All links touching (type, id) on either side. */
  findForResource(userId: string, type: ResourceType, id: string): Promise<ResourceLink[]>
  findById(id: string): Promise<ResourceLink | null>
  delete(id: string, userId: string): Promise<void>
}
