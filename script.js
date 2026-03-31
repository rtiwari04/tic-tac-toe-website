particlesJS("particles-js", {
  particles: {
    number: { value: 70 },
    size: { value: 3 },
    color: { value: "#00adb5" },
    line_linked: { enable: true },
    move: { speed: 2 }
  }
});

let board = [];
let boardSize = 3;
let gameActive = true;
let cells;
let winPatterns = [];

const statusText = document.getElementById("status");
const aiStatus = document.getElementById("aiStatus");
const modal = document.getElementById("modal");
const winnerText = document.getElementById("winnerText");

function generatePatterns(size) {
    let patterns = [];

    for (let i = 0; i < size; i++) {
        let row = [];
        let col = [];
        for (let j = 0; j < size; j++) {
            row.push(i * size + j);
            col.push(j * size + i);
        }
        patterns.push(row, col);
    }

    let d1 = [], d2 = [];
    for (let i = 0; i < size; i++) {
        d1.push(i * size + i);
        d2.push(i * size + (size - i - 1));
    }
    patterns.push(d1, d2);

    return patterns;
}

function createBoard(size) {
    const boardDiv = document.querySelector(".board");
    boardDiv.innerHTML = "";

    board = Array(size * size).fill("");
    winPatterns = generatePatterns(size);

    boardDiv.style.gridTemplateColumns = `repeat(${size}, 100px)`;

    for (let i = 0; i < size * size; i++) {
        let cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.index = i;
        cell.addEventListener("click", handleClick);
        boardDiv.appendChild(cell);
    }

    cells = document.querySelectorAll(".cell");
}

function handleClick(e) {
    let i = e.target.dataset.index;

    if (board[i] !== "" || !gameActive) return;

    makeMove(i, "X");

    if (gameActive) {
        aiStatus.textContent = "🤖 AI Thinking...";
        setTimeout(aiMove, 600);
    }
}

function makeMove(i, player) {
    board[i] = player;
    cells[i].textContent = player;
    checkWinner();
}

function aiMove() {
    aiStatus.textContent = "";

    let bestScore = -Infinity;
    let move;

    for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
            board[i] = "O";
            let score = minimax(board, 0, false);
            board[i] = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }

    makeMove(move, "O");
}

function minimax(b, depth, isMax) {
    let result = checkMini(b);
    if (result !== null) return result;

    if (isMax) {
        let best = -Infinity;
        for (let i = 0; i < b.length; i++) {
            if (b[i] === "") {
                b[i] = "O";
                best = Math.max(best, minimax(b, depth+1, false));
                b[i] = "";
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < b.length; i++) {
            if (b[i] === "") {
                b[i] = "X";
                best = Math.min(best, minimax(b, depth+1, true));
                b[i] = "";
            }
        }
        return best;
    }
}

function checkMini(b) {
    for (let p of winPatterns) {
        let first = b[p[0]];
        if (!first) continue;

        if (p.every(i => b[i] === first)) {
            return first === "O" ? 1 : -1;
        }
    }

    if (!b.includes("")) return 0;
    return null;
}

function checkWinner() {
    for (let p of winPatterns) {
        let first = board[p[0]];
        if (!first) continue;

        if (p.every(i => board[i] === first)) {

            p.forEach(i => cells[i].classList.add("win"));

            gameActive = false;
            showExplosion();
            showModal(`🏆 Champion: Player ${first}`);
            return;
        }
    }

    if (!board.includes("")) {
        showModal("Game Draw!");
        gameActive = false;
    }
}

function showExplosion() {
    for (let i = 0; i < 50; i++) {
        let div = document.createElement("div");
        div.className = "explosion";
        div.style.setProperty("--x", (Math.random()*300-150)+"px");
        div.style.setProperty("--y", (Math.random()*300-150)+"px");
        document.body.appendChild(div);
        setTimeout(()=>div.remove(),700);
    }
}

function showModal(text) {
    winnerText.textContent = text;
    modal.style.display = "flex";
}

function closeModal() {
    modal.style.display = "none";
    restartGame();
}

function restartGame() {
    createBoard(boardSize);
    gameActive = true;
    statusText.textContent = "Your Turn (X)";
}

function setBoardSize(size) {
    boardSize = size;
    restartGame();
}

createBoard(3);