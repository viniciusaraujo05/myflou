import { z } from 'zod'
const HEX = /^#[0-9a-fA-F]{6}$/
export const CreateLinkCategorySchema = z.object({ name: z.string().min(1).max(50), color: z.string().regex(HEX).default('#6366f1'), spaceId: z.string().nullable().optional() })
export const UpdateLinkCategorySchema = z.object({ name: z.string().min(1).max(50).optional(), color: z.string().regex(HEX).optional(), spaceId: z.string().nullable().optional() })
export const GetLinkCategoriesQuerySchema = z.object({ space: z.string().optional() })
