let tipPara = document.getElementById('tip');

let tips = [
    `Take the Center If you’re the first player (X), always start by taking the center square. This gives you the most opportunities to create a line of three.`,
    `Control the Corners If the center is taken, aim for a corner. Corners are strategic because they can be part of multiple winning combinations (horizontal, vertical, and diagonal).`,
    `Block Your Opponent Always keep an eye on your opponent’s moves. If they have two in a row, block them immediately to prevent them from winning.`,
    `Create a Fork Try to set up a situation where you have two ways to win on your next move. This forces your opponent to block one, allowing you to win with the other.`,
    `Avoid Traps If your opponent takes the center, be careful not to let them create a fork. Focus on blocking their potential winning moves.`,
    `Force a Draw If both players play optimally, Tic Tac Toe will always end in a draw. Focus on blocking your opponent and creating opportunities without leaving openings.`,
    `Practice Patterns Learn common patterns and strategies. The more you play, the better you’ll recognize winning opportunities and traps.`,
    `Play as Second Player (O) If you’re the second player, your goal is usually to force a draw. Focus on blocking and mirroring your opponent’s moves to prevent them from creating a fork.`,
];

tipPara.innerText = tips[Math.floor(Math.random() * (tips.length - 1 - 0 + 1))];
console.log(Math.floor(Math.random() * (7 - 0 + 1)));
document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.cell');
    const statusText = document.getElementById('status');
    const resetButton = document.getElementById('reset-button');

    let currentPlayer = 'X';
    let board = ['', '', '', '', '', '', '', '', ''];
    let isGameActive = true;

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

        if (board[index] !== '' || !isGameActive) return;

        board[index] = currentPlayer;
        cell.textContent = currentPlayer;
        checkResult();

        if (isGameActive) togglePlayer();
    };

    const togglePlayer = () => {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusText.textContent = `Player ${currentPlayer}'s turn`;
    };

    const checkResult = () => {
        let roundWon = false;

        for (let condition of winningConditions) {
            const [a, b, c] = condition;

            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                roundWon = true;
                highlightWinningCells([a, b, c]);
                break;
            }
        }

        if (roundWon) {
            statusText.textContent = `Player ${currentPlayer} wins! 🎉`;
            isGameActive = false;
            return;
        }

        if (!board.includes('')) {
            statusText.textContent = "It's a draw! 😅";
            isGameActive = false;
        }
    };

    const highlightWinningCells = (indexes) => {
        indexes.forEach((index) => {
            cells[index].style.backgroundColor = '#007BFF';
            cells[index].style.color = 'white';
        });
    };

    const resetGame = () => {
        board = ['', '', '', '', '', '', '', '', ''];
        isGameActive = true;
        currentPlayer = 'X';
        statusText.textContent = "Player X's turn";
        cells.forEach((cell) => {
            cell.textContent = '';
            cell.style.backgroundColor = '#e5e7eb';
            cell.style.color = '#1f2937';
        });
    };

    cells.forEach((cell) => cell.addEventListener('click', handleCellClick));
    resetButton.addEventListener('click', resetGame);
});
