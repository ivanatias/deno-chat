import { Application, Router } from 'https://deno.land/x/oak@v12.4.0/mod.ts'
import { stream, streamUsers } from './stream.ts'
import { CLIENTS } from './clients.ts'
import type {
  Socket,
  SocketData as DataFromClient,
  StreamMessage,
} from './types.d.ts'

const port = 8080
const router = new Router()

router.get('/start-chat', (ctx) => {
  const socket = ctx.upgrade() as Socket
  const { url } = ctx.request

  const randomUser = `Anonymous-${Math.floor(Math.random() * 1000)}`

  const usernameFromReq = url.searchParams.get('username') || randomUser

  if (CLIENTS.has(usernameFromReq)) {
    const loggedMessage = `${usernameFromReq} is already connected`
    console.log(`%c ${loggedMessage}`, 'color: red')
    return socket.close(1008, loggedMessage)
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
})

const app = new Application()

app.use(router.routes())
app.use(router.allowedMethods())
app.use(async (ctx) => {
  await ctx.send({
    root: `${Deno.cwd()}/static`,
    index: 'index.html',
  })
})

console.log(`%c Server is running on http://localhost:${port}`, 'color: cyan')
await app.listen({ port })
