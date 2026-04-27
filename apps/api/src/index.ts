import { buildApp } from './app.js'

const start = async () => {
  const port = Number(process.env.PORT) || 3001
  const host = process.env.HOST || '0.0.0.0'

  const app = await buildApp()

  try {
    await app.listen({ port, host })
    console.log(`API running at http://${host}:${port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
