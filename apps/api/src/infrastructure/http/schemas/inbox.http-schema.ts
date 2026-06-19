import { z } from 'zod'

export const CreateInboxItemBodySchema = z.object({
  content: z.string().min(1, 'Content is required').max(5000),
})

export const UpdateInboxItemBodySchema = z.object({
  status: z.enum(['PENDING', 'PROCESSED', 'DISMISSED']).optional(),
  content: z.string().min(1).max(5000).optional(),
})

export const GetInboxQuerySchema = z.object({
  status: z.enum(['PENDING', 'PROCESSED', 'DISMISSED']).optional(),
})
