import { z } from 'zod'

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

export const CreateStatusBodySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  color: z.string().regex(HEX_COLOR, 'Color must be a hex value like #6366f1'),
})

export const UpdateStatusBodySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().regex(HEX_COLOR, 'Color must be a hex value like #6366f1').optional(),
})
