const username = prompt('Please enter your username') ?? ''

const socket = new WebSocket(
  `ws://localhost:8080/start-chat?username=${username}`,
)

const SOCKET_EVENTS = {
  SEND_MESSAGE: 'send-message',
  UPDATE_USERS: 'update-users',
}

const select = (selector) => document.querySelector(selector)

const domHandlers = {
  [SOCKET_EVENTS.SEND_MESSAGE]: ({ username, message }) => {
    const messages = select('.messages')
    messages.innerHTML += `
      <div class="chat-item">
        <img src="https://avatars.dicebear.com/api/croodles/${username}.svg" width="40" height="40" />
        <p><strong>${username}:</strong> ${message}</p>
      </div>
      `
  },
  [SOCKET_EVENTS.UPDATE_USERS]: ({ usernames }) => {
    let usersListHtml = ''
    const usersContainer = select('.users')

    usernames.forEach((username) => {
      usersListHtml += `<p><strong>${username}</strong></p>`
    })

    usersContainer.innerHTML = usersListHtml
  },
}

socket.onmessage = (message) => {
  const { event, ...data } = JSON.parse(message.data)
  const domHandler = domHandlers[event]
  if (domHandler) domHandler(data)
}

socket.onerror = (error) => {
  console.error(error)
}

socket.onclose = ({ code }) => {
  alert(`Connection closed with code: ${code}`)
}

window.onload = () => {
  const form = select('form')

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const messageInput = select('#message-input')

    const message = messageInput.value

    messageInput.value = ''

    socket.send(JSON.stringify({
      event: SOCKET_EVENTS.SEND_MESSAGE,
      message,
    }))
  })
}
