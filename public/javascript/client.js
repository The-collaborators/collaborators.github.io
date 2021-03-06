const socket=io()
let searchUsername,username;
// do {
//     name1 = prompt('Please enter your name: ')
// } while(!name1)
let textarea = document.querySelector('#textarea')
let messageArea = document.querySelector('.message__area')
textarea.addEventListener('keyup', (e) => {
    if(e.key === 'Enter' ) {
        sendMessageToServer(e.target.value)
        //send to server
        
    }
})

function sendMessage(message) {
    let msg = {
        from: username,
        talk: message.trim()
    }
    // Append 
    appendMessage(msg, 'outgoing')
    textarea.value = ''
    scrollToBottom()


}

function sendMessageToServer(message) {
    let msg = {
        from: username,
        talk: message.trim()
    }
    // Append 
    appendMessage(msg, 'outgoing')
    textarea.value = ''
    scrollToBottom()

    // Send to server 
    console.log(msg);
    socket.emit('input', msg)

}

function appendMessage(msg, type) {
    let mainDiv = document.createElement('div')
    let className = type
    mainDiv.classList.add(className, 'message')

    let markup = `
        <h4>${msg.from}</h4>
        <p>${msg.talk}</p>
    `
    mainDiv.innerHTML = markup
    messageArea.appendChild(mainDiv)
}

// Recieve messages 
socket.on('output', (data,username,searchUsername) => {
    username=username;
    searchUsername=searchUsername;
    console.log(data);
    if(data.conversation.length){
        for(var x;x<data.conversation.length;x++)
        {
            if(x.from===username)
            {
                appendMessage(x, 'outgoing')
                scrollToBottom()
            }
            else{
                appendMessage(x, 'incoming')
                scrollToBottom()
            }
            
        }
    }
    
})

function scrollToBottom() {
    messageArea.scrollTop = messageArea.scrollHeight
}
