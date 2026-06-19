import { z } from 'zod'

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

export const CreateSpaceBodySchema = z.object({
  name: z.string().min(1, 'Name is required').max(60, 'Name too long'),
  color: z.string().regex(HEX_COLOR, 'Color must be a hex value like #6366f1').optional(),
  icon: z.string().max(40).nullable().optional(),
  order: z.number().int().min(0).optional(),
})

export const UpdateSpaceBodySchema = z.object({
  name: z.string().min(1).max(60).optional(),
  color: z.string().regex(HEX_COLOR, 'Color must be a hex value like #6366f1').optional(),
  icon: z.string().max(40).nullable().optional(),
  order: z.number().int().min(0).optional(),
  archived: z.boolean().optional(),
})
