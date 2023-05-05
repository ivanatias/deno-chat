import { serve } from './deps.ts'
import { handleSocket } from './socket.ts'
import { serveStatic } from './utils.ts'

const port = 8080

const handler = (req: Request) => {
  const { pathname } = new URL(req.url)
  const upgrade = req.headers.get('upgrade')

  if (upgrade !== 'websocket') {
    return new Response('Request is not trying to upgrade web socket', {
      headers: new Headers({ 'content-type': 'text/plain' }),
      status: 400,
    })
  }

  if (pathname === '/start-chat') return handleSocket(req)

  return serveStatic(pathname)
}

serve(handler, { port })
