import type { FastifyInstance } from 'fastify'
import { CreateFolderSchema, UpdateFolderSchema } from '../schemas/folder.http-schema.js'

export async function folderRoutes(app: FastifyInstance) {
  const auth = { preHandler: [app.authenticate] }

  app.get('/', auth, async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
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
    const { sub: userId } = request.user as { sub: string }
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
    const { sub: userId } = request.user as { sub: string }
    const existing = await app.prisma.folder.findUnique({ where: { id: folderId } })
    if (!existing || existing.userId !== userId) {
      return reply.status(404).send({ statusCode: 404, message: 'Not found' })
    }
    const folder = await app.container.folder.updateFolder.execute({ folderId, ...parsed.data })
    return reply.send(folder)
  })

  app.delete('/:id', auth, async (request, reply) => {
    const { id: folderId } = request.params as { id: string }
    const { sub: userId } = request.user as { sub: string }
    const existing = await app.prisma.folder.findUnique({ where: { id: folderId } })
    if (!existing || existing.userId !== userId) {
      return reply.status(404).send({ statusCode: 404, message: 'Not found' })
    }
    await app.container.folder.deleteFolder.execute(folderId)
    return reply.status(204).send()
  })
}
