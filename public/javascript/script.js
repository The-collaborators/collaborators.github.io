const socket = io('http://localhost:3000')
const messageContainer = document.getElementById('message-container')
const roomContainer = document.getElementById('room-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')
const username=document.getElementById('username').innerHTML;

if (messageForm != null) {
  console.log("hello");
  appendMessage('You joined')
  socket.emit('new-user', roomName, username)

  messageForm.addEventListener('submit', e => {
    e.preventDefault()
    const message = messageInput.value
    appendMessage(`You: ${message}`)
    socket.emit('send-chat-message', roomName, message)
    messageInput.value = ''
  })
}

socket.on('room-created', room => {
  const roomElement = document.createElement('div')
  roomElement.innerText = room
  const roomLink = document.createElement('a')
  roomLink.href = `/dashboard/chat/${room}`
  roomLink.innerText = 'join'
  roomContainer.append(roomElement)
  roomContainer.append(roomLink)
})

socket.on('chat-message', data => {
  console.log("username :",username.slice(1,));
  console.log(" data.name : ",escape(data.name));
  //console.log(" result : ",username.slice(0,-1)==data.name);
  if(username.slice(1,)!=data.name)
  {
    appendMessage(`${data.name}: ${data.message}`)
  }
  else
  {
    appendMessage(`You: ${data.message}`)
  }
  
})

socket.on('user-connected', name => {
  appendMessage(`${name} connected`)
})

socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`)
})



function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageContainer.append(messageElement)
}