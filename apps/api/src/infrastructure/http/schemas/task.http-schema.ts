import { z } from 'zod'

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

export const CreateTaskBodySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  date: z.string().regex(DATE_REGEX, 'Date must be YYYY-MM-DD'),
  description: z.string().max(2000).nullable().optional(),
  hoursSpent: z.number().min(0).max(24).nullable().optional(),
  statusId: z.string().nullable().optional(),
  spaceId: z.string().nullable().optional(),
})

export const UpdateTaskBodySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  date: z.string().regex(DATE_REGEX, 'Date must be YYYY-MM-DD').optional(),
  completed: z.boolean().optional(),
  description: z.string().max(2000).nullable().optional(),
  hoursSpent: z.number().min(0).max(24).nullable().optional(),
  statusId: z.string().nullable().optional(),
  spaceId: z.string().nullable().optional(),
})

export const GetTasksQuerySchema = z.object({
  from: z.string().regex(DATE_REGEX, 'from must be YYYY-MM-DD'),
  to: z.string().regex(DATE_REGEX, 'to must be YYYY-MM-DD'),
  space: z.string().optional(),
})
