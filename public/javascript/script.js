const socket = io('http://localhost:3000')
const messageContainer = document.getElementById('message-container')
const roomContainer = document.getElementById('room-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')
const username=document.getElementById('username').innerHTML;

if (messageForm != null) {
  console.log("hello");
  appendMessage("You","you$_4_4_%_/)joined",2)
  socket.emit('new-user', roomName, username)

  messageForm.addEventListener('submit', e => {
    e.preventDefault()
    const message = messageInput.value
    appendMessage("You",`${message}`,0)
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
  if(username.slice(1,)!=data.name.slice(1,))
  {
    appendMessage(`${data.name}`, `${data.message}`,1)
  }
  else
  {
    appendMessage("You",`${data.message}`,0)
  }
  
})

socket.on('user-connected', name => {
  appendMessage(`${name}`," online",2)
})

socket.on('user-disconnected', name => {
  appendMessage(`${name}`," offline",2)
})

// const cb = document.getElementById('allow_scroll');


function appendMessage(name,message,id) {
  const messageElement = document.createElement('div')
  const msgname = document.createElement('div')
  const msg = document.createElement('div')
  const link = document.createElement('a');
  if(id===1)
  {
    link.href="/dashboard/searchUser/"+name;
    link.target="_blank";
    link.appendChild(msgname);
    link.style.textDecoration='none';
  }

  msgname.classList.add("msgname");
  msg.classList.add("msg");

  if(name==="You" && message==="you$_4_4_%_/)joined")
  {
    msgname.innerHTML="You";
    msg.innerHTML=" joined";
  }
  else if(name==="You" && message!="you$_4_4_%_/)joined")
  {
    msgname.innerHTML="";
    msg.innerHTML=message;
  }
  else
  {
    msgname.innerHTML=name;
    msg.innerHTML=message;
  }

  if(id===1)
  messageElement.appendChild(link);
  else
  messageElement.appendChild(msgname);
  messageElement.appendChild(msg);

  // messageElement.innerText = message
  if(id===0)
  {
    messageElement.classList.add("right");
  }
  else if(id===1){
    messageElement.classList.add("left");
  }
  else{
    messageElement.classList.add("middle");
  }
  messageContainer.append(messageElement);
  document.getElementById('allow_scroll').checked = false;
}