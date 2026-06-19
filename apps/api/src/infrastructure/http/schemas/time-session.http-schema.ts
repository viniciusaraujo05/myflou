import { z } from 'zod'

export const StartFocusBodySchema = z.object({
  spaceId: z.string().nullable().optional(),
  taskId: z.string().nullable().optional(),
  note: z.string().max(200).nullable().optional(),
})

export const TimeSummaryQuerySchema = z.object({
  space: z.string().optional(),
})
