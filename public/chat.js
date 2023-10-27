const socket = io();

socket.on('message', (data) => {
    displayMessage(data);
});

function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();

    if (message !== '') {
        socket.emit('chatMessage', message);
        displayMessage('You: ' + message);
        messageInput.value = '';
    }
}

function displayMessage(message) {
    const messageList = document.getElementById('message-list');
    const listItem = document.createElement('li');
    listItem.textContent = message.content;
    messageList.appendChild(listItem);
}


function isUserAuthorized() {

}
