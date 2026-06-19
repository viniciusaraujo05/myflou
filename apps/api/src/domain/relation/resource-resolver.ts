export type ResourceType = 'TASK' | 'NOTE' | 'LINK' | 'CREDENTIAL' | 'TRANSACTION' | 'SUBSCRIPTION' | 'MILESTONE'

export const RESOURCE_TYPES: ResourceType[] = ['TASK', 'NOTE', 'LINK', 'CREDENTIAL', 'TRANSACTION', 'SUBSCRIPTION', 'MILESTONE']

export interface ResolvedResource {
  type: ResourceType
  id: string
  userId: string
  title: string
}

/** Looks up any resource by (type, id) — used to validate ownership and label links. */
export interface IResourceResolver {
  resolve(type: ResourceType, id: string): Promise<ResolvedResource | null>
}
