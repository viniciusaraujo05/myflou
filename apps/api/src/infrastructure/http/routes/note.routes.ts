import type { FastifyInstance } from 'fastify'
import { CreateNoteSchema, UpdateNoteSchema, GetNotesQuerySchema } from '../schemas/note.http-schema.js'
import { getRequestUserId } from '../request-user.js'

export async function noteRoutes(app: FastifyInstance) {
  const auth = { preHandler: [app.authenticate] }

  app.get('/', auth, async (request, reply) => {
    const parsed = GetNotesQuerySchema.safeParse(request.query)
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        message: parsed.error.errors[0]?.message ?? 'Validation error',
        code: 'VALIDATION_ERROR',
      })
    }
    const userId = getRequestUserId(request)
    const notes = await app.container.note.getNotes.execute({ userId, ...parsed.data })
    return reply.send(notes)
  })

  app.post('/', auth, async (request, reply) => {
    const parsed = CreateNoteSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        message: parsed.error.errors[0]?.message ?? 'Validation error',
        code: 'VALIDATION_ERROR',
      })
    }
    const userId = getRequestUserId(request)
    const note = await app.container.note.createNote.execute({ userId, ...parsed.data })
    return reply.status(201).send(note)
  })

  app.get('/:id', auth, async (request, reply) => {
    const { id: noteId } = request.params as { id: string }
    const userId = getRequestUserId(request)
    const note = await app.container.note.getNote.execute({ noteId, userId })
    return reply.send(note)
  })

  app.patch('/:id', auth, async (request, reply) => {
    const { id: noteId } = request.params as { id: string }
    const parsed = UpdateNoteSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        message: parsed.error.errors[0]?.message ?? 'Validation error',
        code: 'VALIDATION_ERROR',
      })
    }
    const userId = getRequestUserId(request)
    const note = await app.container.note.updateNote.execute({ noteId, userId, ...parsed.data })
    return reply.send(note)
  })

  app.delete('/:id', auth, async (request, reply) => {
    const { id: noteId } = request.params as { id: string }
    const userId = getRequestUserId(request)
    await app.container.note.deleteNote.execute({ noteId, userId })
    return reply.status(204).send()
  })
}
