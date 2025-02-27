function showAlert(message, redirectUrl) {
    const alertOverlay = document.getElementById('custom-alert');
    const coinGif = document.getElementById('coin-gif');
    const alertMessage = document.getElementById('alert-message');
    const winningPara = document.getElementById('winning-para');
    const okButton = document.getElementById('ok-button');

    if (message != 'You Won!') {
        winningPara.innerHTML = '';
    }
    alertMessage.textContent = message;
    alertOverlay.classList.add('active');

    okButton.addEventListener('click', () => {
        window.location.href = '/';
    });
}

// Game Logic

const socket = io({ transports: ['websocket'] });
const data = window.location.pathname.split('/');
const userId = data.pop();
const roomId = data.pop();
let username = '';

function cancelWaiting() {
    window.location.href = '/';
    socket.emit('destroy-room', roomId);
}

let currentPlayer = '';
let currentTurn = '';
let board = ['', '', '', '', '', '', '', '', ''];
let isGameActive = true;

if (roomId != 'waitingrooms') socket.emit('join-room', { roomId, userId });

socket.on('load-waiting-window', (user) => {
    // document.getElementById('game-container').style.display = 'none';
    // document.getElementById('chatWidget').style.display = 'none';
    document.getElementById('waiting-container').style.display = 'block';
    username = user.username;
    document.getElementById('player-x').src = user.profilePic.replace(
        './public',
        '',
    );
});

socket.on('load-game-board', (user) => {
    document.getElementById('waiting-container').classList.remove('active');
    document.getElementById('chatWidget').classList.add('active');
    document.getElementById('waiting-container').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    document.getElementById('chatWidget').style.display = 'block';
    if (currentPlayer == 'X')
        document.getElementById('welcome-message').innerText +=
            user.username + '! 🎮';
    document.getElementById('game-container').classList.add('active');
    document.getElementById('player-o').src = user.profilePic.replace(
        './public',
        '',
    );

    if (currentPlayer == 'X')
        socket.emit('req-sync-profile-pic', {
            roomId,
            xPlayer: document.getElementById('player-x').src,
            oPlayer: user.profilePic.replace('./public', ''),
            username,
        });
});

const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const resetButton = document.getElementById('reset-button');

socket.on('player-joined', ({ roomid, player }) => {
    console.log(roomId, player);
    currentPlayer = player;
    currentTurn = 'X';
});

socket.on('sync-profile-pic', ({ xPlayer, oPlayer, username }) => {
    document.getElementById('player-x').src = xPlayer;
    document.getElementById('player-o').src = oPlayer;
    if (currentPlayer == 'O')
        document.getElementById('welcome-message').innerText +=
            username + '! 🎮';
});

socket.on('start-game', ({ roomId }) => {
    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    const handleCellClick = (e) => {
        const cell = e.target;
        const index = cell.getAttribute('data-index');
        console.log(currentPlayer, currentTurn);
        if (
            board[index] !== '' ||
            !isGameActive ||
            currentPlayer !== currentTurn
        )
            return;
        console.log(currentPlayer, 'currentPlayer');
        socket.emit('player-click', {
            index,
            roomId,
            player: currentPlayer,
        });
    };

    const togglePlayer = () => {
        let nextTurn = currentTurn === 'X' ? 'O' : 'X';
        socket.emit('next-turn', { nextTurn, roomId });
        statusText.textContent = `Player ${nextTurn}'s turn`;
    };

    const checkResult = () => {
        let roundWon = false;

        for (let condition of winningConditions) {
            const [a, b, c] = condition;

            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                roundWon = true;
                highlightWinningCells([a, b, c]); // Highlight winning cells
                break;
            }
        }

        if (roundWon) {
            socket.emit('player-won', {
                playerWon: currentTurn,
                currentPlayer,
                roomId,
                userId,
            });
            return;
        }

        if (!board.includes('')) {
            socket.emit('draw', { roomId });
            showAlert('Draw!', '/');
            isGameActive = false;
        }
    };

    const highlightWinningCells = (indexes) => {
        indexes.forEach((index) => {
            cells[index].style.backgroundColor = '#007BFF';
            cells[index].style.color = 'white';
        });
    };

    cells.forEach((cell) => cell.addEventListener('click', handleCellClick));

    socket.on('make-changes', ({ index, player }) => {
        board[index] = player;
        let targetCell = document.querySelector(
            '.cell[data-index="' + index + '"]',
        );
        targetCell.textContent = player;
        checkResult();
        if (isGameActive) togglePlayer();
    });

    socket.on('set-turn', ({ nextTurn }) => {
        currentTurn = nextTurn;
    });

    socket.on('game-over', ({ playerWon }) => {
        let result = playerWon == currentPlayer ? 'Won' : 'Lost';
        showAlert(`You ${result}!`, '/');
        isGameActive = false;

        socket.emit('destroy-room', roomId);
    });

    socket.on('game-draw', () => {
        showAlert('Draw', '/');
        isGameActive = false;

        socket.emit('destroy-room', roomId);
    });

    socket.on('player-disconnected', ({ socketId }) => {
        if (socketId != socket.id) {
            showAlert('You Won!', '/');
            isGameActive = false;
            socket.emit('destroy-room', roomId);
            socket.emit('increase-pts', { roomId, userId });
        }
    });
});

window.addEventListener('beforeunload', () => {
    if (isGameActive) {
        socket.emit('page-refreshed');
        socket.emit('dicrease-pts', { roomId, userId });
        window.location.href = 'http://localhost:3000';
    }
});

// Message Client

const chatWidget = document.querySelector('.chat-widget');
const chatHeader = document.querySelector('.chat-header');
const hideButton = document.querySelector('.hide-chat');
const closeButton = document.querySelector('.close-chat');
const chatBody = document.querySelector('.chat-body');
const reopenButton = document.querySelector('.reopen-chat');
const notification = document.querySelector('.notification');

socket.on('got-message', (messageText) => {
    if (messageText) {
        const messageElement = document.createElement('p');
        messageElement.className = 'message';
        messageElement.textContent = messageText;
        document.querySelector('.messages').appendChild(messageElement);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    notification.classList.remove('hidden');
});

socket.on('got-sticker', (sticker) => {
    const messageElement = document.createElement('p');
    messageElement.className = 'message';
    messageElement.innerHTML = `<img src="/images/${sticker}.gif" alt="Dab sticker">`;
    document.querySelector('.messages').appendChild(messageElement);
    chatBody.scrollTop = chatBody.scrollHeight;
    notification.classList.remove('hidden');
    console.log(sticker);
});

// Dragging functionality
let isDragging = false;
let offsetX, offsetY;

chatHeader.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - chatWidget.offsetLeft;
    offsetY = e.clientY - chatWidget.offsetTop;
    chatWidget.style.transition = 'none';
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        chatWidget.style.left = `${e.clientX - offsetX}px`;
        chatWidget.style.top = `${e.clientY - offsetY}px`;
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    chatWidget.style.transition = 'all 0.3s ease';
});

// Mobile Devices

chatHeader.addEventListener(
    'touchstart',
    (e) => {
        isDragging = true;
        const touch = e.touches[0];
        offsetX = touch.clientX - chatWidget.offsetLeft;
        offsetY = touch.clientY - chatWidget.offsetTop;
        chatWidget.style.transition = 'none';
    },
    { passive: true },
);

document.addEventListener(
    'touchmove',
    (e) => {
        if (isDragging) {
            e.preventDefault();

            const touch = e.touches[0];
            chatWidget.style.left = `${touch.clientX - offsetX}px`;
            chatWidget.style.top = `${touch.clientY - offsetY}px`;
        }
    },
    { passive: true },
);

document.addEventListener(
    'touchend',
    () => {
        isDragging = false;
        chatWidget.style.transition = 'all 0.3s ease';
    },
    { passive: true },
);

// Close functionality
closeButton.addEventListener('click', () => {
    chatWidget.classList.add('hidden');
    reopenButton.classList.remove('hidden');
    notification.classList.add('hidden');
});

// Reopen chat functionality
reopenButton.addEventListener('click', () => {
    chatWidget.classList.remove('hidden');
    reopenButton.classList.add('hidden');
    notification.classList.add('hidden');
});

// send message functionality
document.querySelector('.send-message').addEventListener('click', () => {
    const input = document.querySelector('.chat-footer input');
    const messageText = input.value.trim();

    if (messageText) {
        const messageElement = document.createElement('p');
        messageElement.className = 'message';
        messageElement.classList.add('right');
        messageElement.textContent = messageText;
        document.querySelector('.messages').appendChild(messageElement);
        input.value = '';
        chatBody.scrollTop = chatBody.scrollHeight;
        socket.emit('send-message', {
            roomId,
            messageText,
        });
    }
});

document
    .querySelector('.chat-footer input')
    .addEventListener('keypress', (e) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            document.querySelector('.send-message').click();
        }
    });

function sendSticker(sticker) {
    const messageElement = document.createElement('p');
    messageElement.className = 'message';
    messageElement.classList.add('right');
    messageElement.innerHTML = `<img src="/images/${sticker}.gif" alt="Dab sticker">`;
    document.querySelector('.messages').appendChild(messageElement);
    chatBody.scrollTop = chatBody.scrollHeight;
    socket.emit('send-sticker', {
        roomId,
        sticker,
    });
}
