import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import readHexagram from './api/read-hexagram'
import readTarot from './api/read-tarot'

type DevApiRequest = {
  method?: string
  body?: unknown
}

type DevApiResponse = {
  status(code: number): {
    json(payload: unknown): void
  }
}

type DevApiHandler = (req: DevApiRequest, res: DevApiResponse) => unknown | Promise<unknown>

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  const raw = Buffer.concat(chunks).toString('utf8').trim()
  if (!raw) return undefined
  return JSON.parse(raw)
}

function createDevApiMiddleware(handler: DevApiHandler) {
  return async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const body = await readJsonBody(req)
      let statusCode = 200
      let sent = false

      const apiRes: DevApiResponse = {
        status(code: number) {
          statusCode = code
          return {
            json(payload: unknown) {
              if (sent) return
              sent = true
              res.statusCode = statusCode
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify(payload))
            },
          }
        },
      }

      await handler({ method: req.method, body }, apiRes)

      if (!sent) {
        res.statusCode = 204
        res.end()
      }
    } catch (error) {
      console.error('Dev API middleware error:', error)
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify({ error: 'Dev API failed' }))
    }
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  process.env.AI_API_KEY ||= env.AI_API_KEY

  return {
    plugins: [
      react(),
      {
        name: 'local-api-middleware',
        configureServer(server) {
          server.middlewares.use('/api/read-tarot', createDevApiMiddleware(readTarot as unknown as DevApiHandler))
          server.middlewares.use('/api/read-hexagram', createDevApiMiddleware(readHexagram as unknown as DevApiHandler))
        },
      },
    ],
  }
})
