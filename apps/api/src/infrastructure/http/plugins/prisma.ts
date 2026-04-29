import fp from 'fastify-plugin'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import type { FastifyInstance } from 'fastify'

export const prismaPlugin = fp(async (app: FastifyInstance) => {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  await prisma.$connect()

  app.decorate('prisma', prisma)

  app.addHook('onClose', async () => {
    await prisma.$disconnect()
    await pool.end()
  })
})

// Augment FastifyInstance types
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}
