import { z } from 'zod'
export const CreateNoteSchema = z.object({ title: z.string().max(200).default('Untitled'), folderId: z.string().nullable().optional(), spaceId: z.string().nullable().optional() })
export const UpdateNoteSchema = z.object({ title: z.string().max(200).optional(), content: z.unknown().optional(), folderId: z.string().nullable().optional(), spaceId: z.string().nullable().optional() })
export const GetNotesQuerySchema = z.object({ folderId: z.string().optional(), q: z.string().optional(), search: z.string().optional(), space: z.string().optional() })
