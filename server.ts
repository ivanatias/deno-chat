import { serve } from './deps.ts'
import { handleSocket } from './socket.ts'
import { serveStatic } from './utils.ts'

const port = 8080

const handler = (req: Request) => {
  const { pathname } = new URL(req.url)

  if (pathname === '/start-chat') return handleSocket(req)

  return serveStatic(pathname)
}

serve(handler, { port })
