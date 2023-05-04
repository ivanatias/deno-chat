export type Socket = WebSocket & { username: string }

type Event = 'send-message' | 'update-users'

export interface SocketData {
  event: Event
  message: string
}

export interface StreamUsers extends Pick<SocketData, 'event'> {
  usernames: string[]
}

export interface StreamMessage extends SocketData {
  username: string
}
