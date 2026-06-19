import type { FastifyInstance } from 'fastify'
import {
  CreateTaskBodySchema,
  UpdateTaskBodySchema,
  GetTasksQuerySchema,
} from '../schemas/task.http-schema.js'
import { getRequestUserId } from '../request-user.js'

export async function taskRoutes(app: FastifyInstance) {
  // All task routes require authentication
  const auth = { preHandler: [app.authenticate] }

  // GET /tasks?from=YYYY-MM-DD&to=YYYY-MM-DD
  app.get('/', auth, async (request, reply) => {
    const parsed = GetTasksQuerySchema.safeParse(request.query)
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        message: parsed.error.issues[0]?.message ?? 'Validation error',
        code: 'VALIDATION_ERROR',
      })
    }
    const userId = getRequestUserId(request)
    const { space, milestone, ...rest } = parsed.data
    const tasks = await app.container.task.getTasks.execute({ userId, ...rest, spaceId: space, milestoneId: milestone })
    return reply.send(tasks)
  })

  // POST /tasks
  app.post('/', { ...auth, config: { rateLimit: { max: 60, timeWindow: '1m' } } }, async (request, reply) => {
    const parsed = CreateTaskBodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        message: parsed.error.issues[0]?.message ?? 'Validation error',
        code: 'VALIDATION_ERROR',
      })
    }
    const userId = getRequestUserId(request)
    const task = await app.container.task.createTask.execute({ userId, ...parsed.data })
    return reply.status(201).send(task)
  })

  // PATCH /tasks/:id
  app.patch('/:id', auth, async (request, reply) => {
    const { id: taskId } = request.params as { id: string }
    const parsed = UpdateTaskBodySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        statusCode: 400,
        message: parsed.error.issues[0]?.message ?? 'Validation error',
        code: 'VALIDATION_ERROR',
      })
    }
    const userId = getRequestUserId(request)
    const task = await app.container.task.updateTask.execute({ taskId, userId, ...parsed.data })
    return reply.send(task)
  })

  // DELETE /tasks/:id
  app.delete('/:id', auth, async (request, reply) => {
    const { id: taskId } = request.params as { id: string }
    const userId = getRequestUserId(request)
    await app.container.task.deleteTask.execute({ taskId, userId })
    return reply.status(204).send()
  })
}
