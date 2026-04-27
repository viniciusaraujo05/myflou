import { z } from 'zod'
const HEX = /^#[0-9a-fA-F]{6}$/
export const CreateFolderSchema = z.object({ name: z.string().min(1).max(50), color: z.string().regex(HEX).default('#6366f1') })
export const UpdateFolderSchema = z.object({ name: z.string().min(1).max(50).optional(), color: z.string().regex(HEX).optional() })
