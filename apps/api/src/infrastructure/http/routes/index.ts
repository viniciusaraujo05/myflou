import type { FastifyInstance } from 'fastify'
import { authRoutes } from './auth.routes.js'
import { userRoutes } from './user.routes.js'
import { spaceRoutes } from './space.routes.js'
import { taskRoutes } from './task.routes.js'
import { statusRoutes } from './status.routes.js'
import { folderRoutes } from './folder.routes.js'
import { noteRoutes } from './note.routes.js'
import { linkCategoryRoutes } from './link-category.routes.js'
import { linkRoutes } from './link.routes.js'
import { aiRoutes } from './ai.routes.js'
import { credentialRoutes } from './credential.routes.js'
import { transactionRoutes } from './transaction.routes.js'
import { subscriptionRoutes } from './subscription.routes.js'

export async function registerRoutes(app: FastifyInstance) {
  await app.register(authRoutes, { prefix: '/auth' })
  await app.register(userRoutes, { prefix: '/users' })
  await app.register(spaceRoutes, { prefix: '/spaces' })
  await app.register(taskRoutes, { prefix: '/tasks' })
  await app.register(statusRoutes, { prefix: '/statuses' })
  await app.register(folderRoutes, { prefix: '/folders' })
  await app.register(noteRoutes, { prefix: '/notes' })
  await app.register(linkCategoryRoutes, { prefix: '/link-categories' })
  await app.register(linkRoutes, { prefix: '/links' })
  await app.register(aiRoutes, { prefix: '/ai' })
  await app.register(credentialRoutes, { prefix: '/credentials' })
  await app.register(transactionRoutes, { prefix: '/transactions' })
  await app.register(subscriptionRoutes, { prefix: '/subscriptions' })
}
