import { z } from 'zod'
export const CreateLinkSchema = z.object({
  title: z.string().min(1).max(200),
  url: z.string().url('Must be a valid URL'),
  description: z.string().max(500).nullable().optional(),
  username: z.string().max(200).nullable().optional(),
  password: z.string().max(200).nullable().optional(),
  categoryId: z.string().nullable().optional(),
  spaceId: z.string().nullable().optional(),
})
export const UpdateLinkSchema = CreateLinkSchema.partial()
export const GetLinksQuerySchema = z.object({ categoryId: z.string().optional(), space: z.string().optional() })
