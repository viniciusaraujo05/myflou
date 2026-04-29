import type { FastifyInstance } from 'fastify'
import { CreateLinkCategorySchema, UpdateLinkCategorySchema } from '../schemas/link-category.http-schema.js'
import { getRequestUserId } from '../request-user.js'

export async function linkCategoryRoutes(app: FastifyInstance) {
  const auth = { preHandler: [app.authenticate] }

  app.get('/', auth, async (request, reply) => {
    const userId = getRequestUserId(request)
    const categories = await app.container.linkCategory.getLinkCategories.execute(userId)
    return reply.send(categories)
  })

  app.post('/', auth, async (request, reply) => {
    const parsed = CreateLinkCategorySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        message: parsed.error.issues[0]?.message ?? 'Validation error',
        code: 'VALIDATION_ERROR',
      })
    }
    const userId = getRequestUserId(request)
    const category = await app.container.linkCategory.createLinkCategory.execute({ userId, ...parsed.data })
    return reply.status(201).send(category)
  })

  app.patch('/:id', auth, async (request, reply) => {
    const { id: categoryId } = request.params as { id: string }
    const parsed = UpdateLinkCategorySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        message: parsed.error.issues[0]?.message ?? 'Validation error',
        code: 'VALIDATION_ERROR',
      })
    }
    const userId = getRequestUserId(request)
    const category = await app.container.linkCategory.updateLinkCategory.execute({ categoryId, userId, ...parsed.data })
    return reply.send(category)
  })

  app.delete('/:id', auth, async (request, reply) => {
    const { id: categoryId } = request.params as { id: string }
    const userId = getRequestUserId(request)
    await app.container.linkCategory.deleteLinkCategory.execute({ categoryId, userId })
    return reply.status(204).send()
  })
}
