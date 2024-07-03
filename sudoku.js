document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const difficulty = urlParams.get('difficulty');
    let board = Array.from({ length: 9 }, () => Array(9).fill('.'));
    let solutionBoard = JSON.parse(JSON.stringify(board));
    let timerInterval;
    let startTime;

    function possible(board, i, j, val) {
        for (let k = 0; k < 9; k++) {
            if (board[k][j] == val || board[i][k] == val) return false;
        }
        let col = Math.floor(j / 3) * 3;
        let row = Math.floor(i / 3) * 3;
        for (let k = 0; k < 3; k++) {
            for (let l = 0; l < 3; l++) {
                if (board[k + row][l + col] == val) return false;
            }
        }
        return true;
    }

    function solve(board) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j] == '.') {
                    for (let ch = '1'; ch <= '9'; ch++) {
                        if (possible(board, i, j, ch)) {
                            board[i][j] = ch;
                            if (solve(board)) return true;
                            board[i][j] = '.';
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function generateSudoku() {
        clearBoard();
        fillDiagonalBoxes();
        solve(board);
        removeCellsBasedOnDifficulty();
        solutionBoard = JSON.parse(JSON.stringify(board));
        solve(solutionBoard);
        updateBoard();
        startTimer();
    }

    function fillDiagonalBoxes() {
        for (let i = 0; i < 9; i += 3) fillBox(i, i);
    }

    function fillBox(row, col) {
        let num;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                do {
                    num = Math.floor(Math.random() * 9) + 1;
                } while (!possible(board, row + i, col + j, num));
                board[row + i][col + j] = num.toString();
            }
        }
    }

    function removeCellsBasedOnDifficulty() {
        let cellsToRemove;
        switch (difficulty) {
            case 'easy':
                cellsToRemove = 40;
                break;
            case 'medium':
                cellsToRemove = 50;
                break;
            case 'hard':
                cellsToRemove = 60;
                break;
        }

        let cells = Array.from({ length: 81 }, (_, index) => index);
        shuffle(cells);

        for (let i = 0; i < cellsToRemove; i++) {
            let row = Math.floor(cells[i] / 9);
            let col = cells[i] % 9;
            board[row][col] = '.';
        }
    }

    function showSolution() {
        board = JSON.parse(JSON.stringify(solutionBoard));
        updateBoard();
        clearInterval(timerInterval);
    }

    function goToHome() {
        window.location.href = 'home.html';
    }

    function updateBoard() {
        const table = document.getElementById('sudoku-board');
        table.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const row = table.insertRow();
            for (let j = 0; j < 9; j++) {
                const cell = row.insertCell();
                if (board[i][j] == '.') {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.maxLength = 1;
                    input.pattern = '[1-9]';
                    input.dataset.row = i;
                    input.dataset.col = j;
                    input.addEventListener('input', () => handleInput(input, i, j));
                    input.addEventListener('keypress', (event) => restrictInput(event));
                    cell.appendChild(input);
                } else {
                    cell.textContent = board[i][j];
                    cell.classList.add('pre-filled');
                }
            }
        }
    }

    function handleInput(input, i, j) {
        const value = input.value;
        if (value === '') {
            input.classList.remove('incorrect');
            board[i][j] = '.'; // Clear the board cell
        } else if (/^[1-9]$/.test(value) && possibleForUser(board, i, j, value)) {
            input.classList.remove('incorrect');
            board[i][j] = value; // Update the board with the new value
        } else {
            input.classList.add('incorrect');
            board[i][j] = value; // Even if the value is incorrect, we update the board for further checks
        }
        if (checkWin()) {
            showPopup();
        }
    }

    function restrictInput(event) {
        if (!/[1-9]/.test(event.key)) {
            event.preventDefault();
        }
    }

    function possibleForUser(board, i, j, val) {
        for (let k = 0; k < 9; k++) {
            if ((board[k][j] == val && k != i) || (board[i][k] == val && k != j)) return false;
        }
        let col = Math.floor(j / 3) * 3;
        let row = Math.floor(i / 3) * 3;
        for (let k = 0; k < 3; k++) {
            for (let l = 0; l < 3; l++) {
                if ((board[k + row][l + col] == val) && (k + row!= i || l + col != j)) return false;
            }
            }
            return true;
            }
            function checkWin() {
                for (let i = 0; i < 9; i++) {
                    for (let j = 0; j < 9; j++) {
                        if (board[i][j] === '.' || !possibleForUser(board, i, j, board[i][j])) return false;
                    }
                }
                return true;
            }
            
            function showPopup() {
                clearInterval(timerInterval);
                const timeUsed = document.getElementById('timer').textContent;
                document.getElementById('popup-message').textContent = `You win!  ${timeUsed}`;
                document.getElementById('overlay').style.display = 'block';
                document.getElementById('popup').style.display = 'block';
            }
            
            function closePopup() {
                document.getElementById('overlay').style.display = 'none';
                document.getElementById('popup').style.display = 'none';
            }
            
            function clearBoard() {
                board = Array.from({ length: 9 }, () => Array(9).fill('.'));
            }
            
            function startTimer() {
                startTime = new Date().getTime();
                timerInterval = setInterval(updateTimer, 1000);
            }
            
            function updateTimer() {
                const now = new Date().getTime();
                const elapsedTime = Math.floor((now - startTime) / 1000);
                const minutes = String(Math.floor(elapsedTime / 60)).padStart(2, '0');
                const seconds = String(elapsedTime % 60).padStart(2, '0');
                document.getElementById('timer').textContent = `Time: ${minutes}:${seconds}`;
            }
            
            document.getElementById('show-solution').onclick = showSolution;
            document.getElementById('go-to-home').onclick = goToHome;
            
            generateSudoku();
});