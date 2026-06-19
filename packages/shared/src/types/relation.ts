export type ResourceType = 'TASK' | 'NOTE' | 'LINK' | 'CREDENTIAL' | 'TRANSACTION' | 'SUBSCRIPTION' | 'MILESTONE'

/** A resource related to some anchor resource, as returned by GET /relations. */
export interface RelatedResource {
  linkId: string
  type: ResourceType
  id: string
  title: string
}
