function showAlert(message, redirectUrl) {
    const alertOverlay = document.getElementById("custom-alert");
    const coinGif = document.getElementById('coin-gif');
    const alertMessage = document.getElementById("alert-message");
    const winningPara = document.getElementById('winning-para');
    const okButton = document.getElementById("ok-button");

    if (message != 'You Won!') {
        winningPara.innerHTML = ''
    }
    alertMessage.textContent = message;
    alertOverlay.classList.add("active");

    okButton.addEventListener("click", () => {
        window.location.href = '/';
    });
}



const socket = io({ transports: ['websocket'] });
const data = window.location.pathname.split('/');
const userId = data.pop();
const roomId = data.pop();

function cancelWaiting() {
    window.location.href = '/';
    socket.emit('destroy-room', roomId);
}

let currentPlayer = "";
let currentTurn = "";
let board = ["", "", "", "", "", "", "", "", ""];
let isGameActive = true;

if (roomId != 'waitingrooms') socket.emit('join-room', { roomId, userId });

socket.on('load-waiting-window', (user) => {
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('waiting-container').style.display = 'block';
    document.getElementById('player-x').src = user.profilePic.replace('./public', '');
})

socket.on('load-game-board', (user) => {
    document.getElementById('waiting-container').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    document.getElementById('player-o').src = user.profilePic.replace('./public', '');

    if (currentPlayer == 'X') socket.emit('req-sync-profile-pic', { roomId, xPlayer: document.getElementById('player-x').src, oPlayer: user.profilePic.replace('./public', '') })
})

const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const resetButton = document.getElementById("reset-button");

socket.on('player-joined', ({ roomid, player }) => {
    console.log(roomId, player)
    currentPlayer = player;
    currentTurn = 'X'
})

socket.on('sync-profile-pic', ({ xPlayer, oPlayer }) => {
    document.getElementById('player-x').src = xPlayer;
    document.getElementById('player-o').src = oPlayer;
    console.log(xPlayer, oPlayer)
})

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
        const index = cell.getAttribute("data-index");
        console.log(currentPlayer, currentTurn)
        if (board[index] !== "" || !isGameActive || currentPlayer !== currentTurn) return;
        console.log(currentPlayer, 'currentPlayer')
        socket.emit('player-click', {
            index,
            roomId,
            player: currentPlayer,
        });
    };

    const togglePlayer = () => {

        let nextTurn = currentTurn === "X" ? "O" : "X";
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
            socket.emit('player-won', { playerWon: currentTurn, currentPlayer, roomId, userId })
            return;
        }

        if (!board.includes("")) {
            socket.emit('draw', { roomId })
            showAlert('Draw!', '/')
            isGameActive = false;
        }
    };

    const highlightWinningCells = (indexes) => {
        indexes.forEach((index) => {
            cells[index].style.backgroundColor = "#007BFF";
            cells[index].style.color = "white";
        });
    };

    cells.forEach((cell) => cell.addEventListener("click", handleCellClick));

    socket.on('make-changes', ({ index, player }) => {
        board[index] = player;
        let targetCell = document.querySelector('.cell[data-index="' + index + '"]');
        targetCell.textContent = player;
        console.log(player)
        checkResult();
        if (isGameActive) togglePlayer();
    })

    socket.on('set-turn', ({ nextTurn }) => {
        currentTurn = nextTurn;
    })

    socket.on('game-over', ({ playerWon }) => {

        let result = playerWon == currentPlayer ? 'Won' : 'Lost'
        showAlert(`You ${result}!`, '/');
        isGameActive = false;

        socket.emit('destroy-room', roomId);
    })

    socket.on('game-draw', () => {
        showAlert('Draw', '/');
        isGameActive = false;

        socket.emit('destroy-room', roomId);
    })

    socket.on('player-disconnected', ({ socketId }) => {
        if (socketId != socket.id) {
            showAlert('You Won', '/');
            isGameActive = false;
            socket.emit('destroy-room', roomId);
        }
    })
});