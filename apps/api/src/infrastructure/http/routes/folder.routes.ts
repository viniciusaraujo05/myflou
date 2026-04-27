import type { FastifyInstance } from 'fastify'
import { CreateFolderSchema, UpdateFolderSchema } from '../schemas/folder.http-schema.js'
import { getRequestUserId } from '../request-user.js'

export async function folderRoutes(app: FastifyInstance) {
  const auth = { preHandler: [app.authenticate] }

  app.get('/', auth, async (request, reply) => {
    const userId = getRequestUserId(request)
    const folders = await app.container.folder.getFolders.execute(userId)
    return reply.send(folders)
  })

  app.post('/', auth, async (request, reply) => {
    const parsed = CreateFolderSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        message: parsed.error.errors[0]?.message ?? 'Validation error',
        code: 'VALIDATION_ERROR',
      })
    }
    const userId = getRequestUserId(request)
    const folder = await app.container.folder.createFolder.execute({ userId, ...parsed.data })
    return reply.status(201).send(folder)
  })

  app.patch('/:id', auth, async (request, reply) => {
    const { id: folderId } = request.params as { id: string }
    const parsed = UpdateFolderSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        message: parsed.error.errors[0]?.message ?? 'Validation error',
        code: 'VALIDATION_ERROR',
      })
    }
    const userId = getRequestUserId(request)
    const folder = await app.container.folder.updateFolder.execute({ folderId, userId, ...parsed.data })
    return reply.send(folder)
  })

  app.delete('/:id', auth, async (request, reply) => {
    const { id: folderId } = request.params as { id: string }
    const userId = getRequestUserId(request)
    await app.container.folder.deleteFolder.execute({ folderId, userId })
    return reply.status(204).send()
  })
}
