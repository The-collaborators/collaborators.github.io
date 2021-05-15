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
        
        <p>${msg.talk}</p>
    `
    mainDiv.innerHTML = markup
    messageArea.appendChild(mainDiv)
}

// Recieve messages 
socket.on('output', (data,username1,searchUsername1) => {
    // username=username;
    // searchUsername=searchUsername;
    
    console.log("username1",username1);
    console.log("searchUsername1",searchUsername1);
    console.log("data",data);
    if(data.length>0){
        for(var x=0;x<data.length;x++)
        {
            console.log(data[x].from,"from");
            if(data[x].from===username1)
            {
                appendMessage(data[x], 'outgoing')
                scrollToBottom()
            }
            else{
                appendMessage(data[x], 'incoming')
                scrollToBottom()
            }
            
        }
        delete data;
        username1="";
        searchUsername1="";
    }
    
})





function scrollToBottom() {
    messageArea.scrollTop = messageArea.scrollHeight
}
