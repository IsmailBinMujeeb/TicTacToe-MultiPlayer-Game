function showAlert(message, redirectUrl) {
    const alertOverlay = document.getElementById("custom-alert");
    const alertMessage = document.getElementById("alert-message");
    const okButton = document.getElementById("ok-button");

    alertMessage.textContent = message;
    alertOverlay.classList.add("active");

    okButton.addEventListener("click", () => {
        window.location.href = '/';
    });
}

const socket = io();
const roomId = window.location.pathname.split('/').pop();

socket.emit('join-room', roomId);

socket.on('load-waiting-window', ()=>{
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('waiting-container').style.display = 'block';
})

socket.on('load-game-board', ()=>{
    document.getElementById('waiting-container').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
})

const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const resetButton = document.getElementById("reset-button");

let currentPlayer = "";
let currentTurn = "";
let board = ["", "", "", "", "", "", "", "", ""];
let isGameActive = true;

socket.on('player-joined', ({ roomid, player }) => {
    console.log(roomId, player)
    currentPlayer = player;
    currentTurn = 'X'
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
            socket.emit('player-won', { playerWon: currentTurn, roomId })
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
    })

    socket.on('game-draw', () => {
        showAlert('Draw', '/');
        isGameActive = false;
    })
});