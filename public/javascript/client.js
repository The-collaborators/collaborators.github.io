const socket=io.connect('http://localhost:3000')
let searchUsername,username;
searchUsername="";
username="";
let textarea = document.querySelector('#textarea')
let messageArea = document.querySelector('.message__area')
textarea.addEventListener('keyup', (e) => {
    if(e.key === 'Enter' ) {
        sendMessageToServer(e.target.value)
        //send to server
        
    }
})



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
socket.on('output', (data,username1,searchUsername1) => {
    // username=username;
    // searchUsername=searchUsername;
    console.log("output",data);
    if(data.length){
        for(var x;x<data.length;x++)
        {
            if(x.from===username1)
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

socket.on("otheruser",msg=>{
    appendMessage(x, 'incoming');
    scrollToBottom();
    socket.emit("otherUser",msg);
})



function scrollToBottom() {
    messageArea.scrollTop = messageArea.scrollHeight
}
