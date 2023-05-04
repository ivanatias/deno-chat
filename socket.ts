import { CLIENTS } from './clients.ts'
import { stream, streamUsers } from './utils.ts'
import type { Context } from './deps.ts'
import type {
  Socket,
  SocketData as DataFromClient,
  StreamMessage,
} from './types.d.ts'

export function handleSocket(ctx: Context) {
  const socket = ctx.upgrade() as Socket
  const { url } = ctx.request

  const randomUser = `Anonymous-${Math.floor(Math.random() * 1000)}`

  const usernameFromReq = url.searchParams.get('username') || randomUser

  if (CLIENTS.has(usernameFromReq)) {
    const message = `${usernameFromReq} is already connected`

    console.log(`%c ${message}`, 'color: red')

    return socket.close(1008, message)
  }

  socket.username = usernameFromReq

  console.log(`%c ${usernameFromReq} connected`, 'color: cyan')
  CLIENTS.set(usernameFromReq, socket)

  socket.onopen = () => {
    streamUsers()
  }

  socket.onclose = () => {
    CLIENTS.delete(socket.username)
    streamUsers()
  }

  socket.onmessage = (m) => {
    const { event, message } = JSON.parse(m.data) as DataFromClient

    if (event === 'send-message') {
      const messageToClient: StreamMessage = {
        event,
        message,
        username: socket.username,
      }

      stream(JSON.stringify(messageToClient))
    }
  }
}
