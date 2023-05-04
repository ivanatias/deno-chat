import { extname } from './deps.ts'
import { CLIENTS } from './clients.ts'
import type { StreamUsers } from './types.d.ts'

export async function serveStatic(requestPathname: string): Promise<Response> {
  const CONTENT_TYPES = new Map([
    ['.html', 'text/html'],
    ['.css', 'text/css'],
    ['.js', 'application/javascript'],
  ])

  try {
    const staticFilePath = `${Deno.cwd()}/static/${
      requestPathname === '/' ? 'index.html' : requestPathname
    }`

    const file = await Deno.readFile(staticFilePath)
    const ext = extname(staticFilePath)
    const contentType = CONTENT_TYPES.get(ext) ?? 'application/octet-stream'

    return new Response(file, {
      headers: new Headers({ 'content-type': contentType }),
      status: 200,
    })
  } catch (err) {
    return err instanceof Deno.errors.NotFound
      ? new Response('Not Found', { status: 404 })
      : new Response('Internal Server Error', { status: 500 })
  }
}

export function stream(message: string) {
  for (const client of CLIENTS.values()) {
    client.send(message)
  }
}

export function streamUsers() {
  const usersToClient: StreamUsers = {
    event: 'update-users',
    usernames: [...CLIENTS.keys()],
  }

  stream(JSON.stringify(usersToClient))
}
