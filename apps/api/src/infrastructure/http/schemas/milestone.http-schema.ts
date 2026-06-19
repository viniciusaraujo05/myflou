import { z } from 'zod'

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
const STATUS = z.enum(['PLANNED', 'IN_PROGRESS', 'DONE'])

export const CreateMilestoneBodySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(2000).nullable().optional(),
  status: STATUS.optional(),
  targetDate: z.string().regex(DATE_REGEX, 'Date must be YYYY-MM-DD').nullable().optional(),
  spaceId: z.string().nullable().optional(),
  order: z.number().int().min(0).optional(),
})

export const UpdateMilestoneBodySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  status: STATUS.optional(),
  targetDate: z.string().regex(DATE_REGEX, 'Date must be YYYY-MM-DD').nullable().optional(),
  spaceId: z.string().nullable().optional(),
  order: z.number().int().min(0).optional(),
})

export const GetMilestonesQuerySchema = z.object({
  space: z.string().optional(),
})
