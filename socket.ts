import { CLIENTS } from './clients.ts'
import { stream, streamUsers } from './utils.ts'
import type {
  SocketData as DataFromClient,
  StreamMessage,
  UpgradedSocket,
} from './types.d.ts'

export function handleSocket(req: Request): Response {
  const url = new URL(req.url)

  const { socket, response } = Deno.upgradeWebSocket(req) as UpgradedSocket

  const randomUser = `Anonymous-${Math.floor(Math.random() * 1000)}`

  const usernameFromReq = url.searchParams.get('username') || randomUser

  if (CLIENTS.has(usernameFromReq)) {
    const message = `${usernameFromReq} is already connected`
    console.log(`%c ${message}`, 'color: red')

    socket.close(1008, message)

    return new Response(message, {
      status: 409,
      headers: new Headers({ 'content-type': 'text/plain' }),
    })
  }

  socket.username = usernameFromReq
  CLIENTS.set(usernameFromReq, socket)

  socket.onopen = () => {
    streamUsers()
  }

  socket.onclose = () => {
    CLIENTS.delete(socket.username)
    streamUsers()
  }

  socket.onmessage = (m) => {
    const { event, ...data } = JSON.parse(m.data) as DataFromClient

    if (event === 'send-message') {
      const messageToClient: StreamMessage = {
        event,
        message: data.message,
        username: socket.username,
      }

      stream(JSON.stringify(messageToClient))
    }
  }

  return response
}
