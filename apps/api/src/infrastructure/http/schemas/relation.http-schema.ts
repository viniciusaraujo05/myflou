import { z } from 'zod'

const TYPE = z.enum(['TASK', 'NOTE', 'LINK', 'CREDENTIAL', 'TRANSACTION', 'SUBSCRIPTION', 'MILESTONE'])

export const CreateRelationBodySchema = z.object({
  fromType: TYPE,
  fromId: z.string().min(1),
  toType: TYPE,
  toId: z.string().min(1),
})

export const GetRelationsQuerySchema = z.object({
  type: TYPE,
  id: z.string().min(1),
})
