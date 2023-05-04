import type { StreamUsers } from './types.d.ts'
import { CLIENTS } from './clients.ts'

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
