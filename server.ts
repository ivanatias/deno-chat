import { Application, Router } from './deps.ts'
import { handleSocket } from './socket.ts'

const port = 8080
const router = new Router()

router.get('/start-chat', handleSocket)

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
