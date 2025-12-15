let currentConversationId = null;
let chatPollInterval = null;

function loadConversations() {
    fetch('/api/chat/conversations/')
        .then(response => response.json())
        .then(conversations => {
            const list = document.getElementById('chat-list');
            if (conversations.length === 0) {
                list.innerHTML = '<p class="no-messages">No conversation started</p>';
                return;
            }

            list.innerHTML = conversations.map(conv => {
                const otherUser = conv.participants.find(p => p.username !== currentUserUsername); // Need to set currentUserUsername globally or fetch it
                const lastMsg = conv.last_message ? conv.last_message.content : 'No messages yet';
                return `
                    <div class="conversation-item" onclick="openChat(${conv.id}, '${otherUser.username}')">
                        <img src="/static/images/default-avatar.png" class="user-avatar-small">
                        <div class="conv-details">
                            <h4>${otherUser.username}</h4>
                            <p>${lastMsg}</p>
                        </div>
                    </div>
                `;
            }).join('');
        })
        .catch(error => console.error('Error loading conversations:', error));
}

function openChat(conversationId, username) {
    currentConversationId = conversationId;
    document.getElementById('chat-list').style.display = 'none';
    document.getElementById('chat-area').style.display = 'flex';
    document.getElementById('chat-user-name').innerText = username;

    loadMessages();
    if (chatPollInterval) clearInterval(chatPollInterval);
    chatPollInterval = setInterval(loadMessages, 3000); // Poll every 3 seconds
}

function loadMessages() {
    if (!currentConversationId) return;

    fetch(`/api/chat/conversations/${currentConversationId}/messages/`)
        .then(response => response.json())
        .then(messages => {
            const container = document.getElementById('messages-container');
            container.innerHTML = messages.map(msg => {
                const isMe = msg.sender.username === currentUserUsername;
                return `
                    <div class="message ${isMe ? 'sent' : 'received'}">
                        <div class="message-content">${msg.content}</div>
                        <small>${new Date(msg.created_at).toLocaleTimeString()}</small>
                    </div>
                `;
            }).join('');
            container.scrollTop = container.scrollHeight;
        })
        .catch(error => console.error('Error loading messages:', error));
}

document.getElementById('back-to-list').onclick = function () {
    document.getElementById('chat-area').style.display = 'none';
    document.getElementById('chat-list').style.display = 'block';
    currentConversationId = null;
    if (chatPollInterval) clearInterval(chatPollInterval);
    loadConversations();
}

document.getElementById('send-message').onclick = sendMessage;
document.getElementById('message-text').onkeypress = function (e) {
    if (e.key === 'Enter') sendMessage();
}

async function sendMessage() {
    const input = document.getElementById('message-text');
    const content = input.value;
    if (!content || !currentConversationId) return;

    try {
        const response = await fetch(`/api/chat/conversations/${currentConversationId}/messages/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ content })
        });

        if (response.ok) {
            input.value = '';
            loadMessages();
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

// Get current user username
let currentUserUsername = '';
fetch('/api/accounts/current_user/')
    .then(res => res.json())
    .then(user => {
        currentUserUsername = user.username;
    })
    .catch(err => console.log('Not logged in'));
