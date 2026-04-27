import type { FastifyInstance } from 'fastify'
import { CreateLinkCategorySchema, UpdateLinkCategorySchema } from '../schemas/link-category.http-schema.js'

export async function linkCategoryRoutes(app: FastifyInstance) {
  const auth = { preHandler: [app.authenticate] }

  app.get('/', auth, async (request, reply) => {
    const { sub: userId } = request.user as { sub: string }
    const categories = await app.container.linkCategory.getLinkCategories.execute(userId)
    return reply.send(categories)
  })

  app.post('/', auth, async (request, reply) => {
    const parsed = CreateLinkCategorySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        message: parsed.error.errors[0]?.message ?? 'Validation error',
        code: 'VALIDATION_ERROR',
      })
    }
    const { sub: userId } = request.user as { sub: string }
    const category = await app.container.linkCategory.createLinkCategory.execute({ userId, ...parsed.data })
    return reply.status(201).send(category)
  })

  app.patch('/:id', auth, async (request, reply) => {
    const { id: categoryId } = request.params as { id: string }
    const parsed = UpdateLinkCategorySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        message: parsed.error.errors[0]?.message ?? 'Validation error',
        code: 'VALIDATION_ERROR',
      })
    }
    const { sub: userId } = request.user as { sub: string }
    const existing = await app.prisma.linkCategory.findUnique({ where: { id: categoryId } })
    if (!existing || existing.userId !== userId) {
      return reply.status(404).send({ statusCode: 404, message: 'Not found' })
    }
    const category = await app.container.linkCategory.updateLinkCategory.execute({ categoryId, ...parsed.data })
    return reply.send(category)
  })

  app.delete('/:id', auth, async (request, reply) => {
    const { id: categoryId } = request.params as { id: string }
    const { sub: userId } = request.user as { sub: string }
    const existing = await app.prisma.linkCategory.findUnique({ where: { id: categoryId } })
    if (!existing || existing.userId !== userId) {
      return reply.status(404).send({ statusCode: 404, message: 'Not found' })
    }
    await app.container.linkCategory.deleteLinkCategory.execute(categoryId)
    return reply.status(204).send()
  })
}
