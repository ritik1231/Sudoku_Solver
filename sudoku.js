document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const difficulty = urlParams.get('difficulty');
    let board = Array.from({ length: 9 }, () => Array(9).fill('.'));
    let solutionBoard = JSON.parse(JSON.stringify(board));
    let userBoard = Array.from({ length: 9 }, () => Array(9).fill('.'));
    let timerInterval;
    let startTime;
    let showingSolution = false;

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
        updateBoards();
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

    function toggleSolution() {
        const sudokuBoard = document.getElementById('sudoku-board');
        const solutionBoardElement = document.getElementById('solution-board');
        const button = document.getElementById('show-solution');

        if (showingSolution) {
            sudokuBoard.style.display = '';
            solutionBoardElement.style.display = 'none';
            button.textContent = 'Show Solution';
        } else {
            sudokuBoard.style.display = 'none';
            solutionBoardElement.style.display = '';
            button.textContent = 'Hide Solution';
            startTime -= 300000;
        }
        showingSolution = !showingSolution;
    }

    function goToHome() {
        window.location.href = 'home.html';
    }

    function updateBoards() {
        updateBoard('sudoku-board', board, userBoard);
        updateBoard('solution-board', solutionBoard, solutionBoard, true);
    }

    function updateBoard(boardId, currentBoard, userBoard, isSolution = false) {
        const table = document.getElementById(boardId);
        table.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const row = table.insertRow();
            for (let j = 0; j < 9; j++) {
                const cell = row.insertCell();
                if (currentBoard[i][j] == '.') {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.maxLength = 1;
                    input.pattern = '[1-9]';
                    input.inputMode = 'numeric';
                    input.dataset.row = i;
                    input.dataset.col = j;
                    if (!isSolution) {
                        input.value = userBoard[i][j] !== '.' ? userBoard[i][j] : ''; // Restore user input
                        input.addEventListener('input', () => handleInput(input, i, j));
                        input.addEventListener('keypress', (event) => restrictInput(event));
                    }
                    cell.appendChild(input);
                } else {
                    cell.textContent = currentBoard[i][j];
                    cell.classList.add('pre-filled');
                }
            }
        }
    }

    function handleInput(input, i, j) {
        const value = input.value;
        if (value === '') {
            input.classList.remove('incorrect');
            userBoard[i][j] = '.'; // Clear the user board cell
        } else if (/^[1-9]$/.test(value) && possibleForUser(board, userBoard, i, j, value)) {
            input.classList.remove('incorrect');
            userBoard[i][j] = value; // Update the user board with the new value
        } else {
            input.classList.add('incorrect');
            userBoard[i][j] = value; // Even if the value is incorrect, we update the user board for further checks
            startTime -= 10000;
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

    function possibleForUser(board, userBoard, i, j, val) {
        for (let k = 0; k < 9; k++) {
            if ((userBoard[k][j] == val && k != i) || (userBoard[i][k] == val && k != j)) return false;
            if ((board[k][j] == val && k != i) || (board[i][k] == val && k != j)) return false;
        }
        let col = Math.floor(j / 3) * 3;
        let row = Math.floor(i / 3) * 3;
        for (let k = 0; k < 3; k++) {
            for (let l = 0; l < 3; l++) {
                if ((userBoard[k + row][l + col] == val && (k + row != i || l + col != j)) || 
                    (board[k + row][l + col] == val && (k + row != i || l + col != j))) return false;
            }
        }
        return true;
    }

    function checkWin() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if(board[i][j]==='.'){
                    if ((userBoard[i][j] === '.') || !possibleForUser(board, userBoard, i, j, userBoard[i][j])) return false;
                }
            }
        }
        return true;
    }

    function showPopup() {
        clearInterval(timerInterval);
        const timeUsed = document.getElementById('timer').textContent;
        document.getElementById('popup-message').innerHTML = `You won!<br>${timeUsed}`;
        document.getElementById('overlay').style.display = 'block';
        document.getElementById('popup').style.display = 'block';
    }

    function closePopup() {
        document.getElementById('overlay').style.display = 'none';
        document.getElementById('popup').style.display = 'none';
    }

    function clearBoard() {
        board = Array.from({ length: 9 }, () => Array(9).fill('.'));
        userBoard = Array.from({ length: 9 }, () => Array(9).fill('.'));
    }

    function startTimer() {
        startTime = new Date().getTime();
        timerInterval = setInterval(updateTimer, 1000);
    }
    function updateTimer() {
        const now = new Date().getTime();
        const elapsedTime = Math.floor((now - startTime) / 1000);
        const hours = String(Math.floor(elapsedTime / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((elapsedTime % 3600) / 60)).padStart(2, '0');
        const seconds = String(elapsedTime % 60).padStart(2, '0');
        document.getElementById('timer').textContent = `Time: ${hours}:${minutes}:${seconds}`;
    }

    function resetGame() {
        clearUserInputs();
    }

    function clearUserInputs() {
        const table = document.getElementById('sudoku-board');
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = table.rows[i].cells[j];
                if (!cell.classList.contains('pre-filled')) {
                    const input = cell.querySelector('input');
                    input.value = '';
                    input.classList.remove('incorrect');
                    userBoard[i][j] = '.'; // Clear the user board cell
                }
            }
        }
    }

    function getHint() {
        let hintCell = null;
        let hintValue = '';
    
        // Try to find a cell with a unique possible value
        outerLoop:
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j] === '.' && userBoard[i][j] === '.') {
                    let possibleValues = [];
                    for (let ch = '1'; ch <= '9'; ch++) {
                        if (possible(board, i, j, ch) && possibleForUser(board, userBoard, i, j, ch)) {
                            possibleValues.push(ch);
                        }
                    }
                    if (possibleValues.length === 1) {
                        hintCell = { row: i, col: j };
                        hintValue = possibleValues[0];
                        break outerLoop;
                    }
                }
            }
        }
    
        // If no cell with a unique possible value was found, highlight any cell with possible values
        if (!hintCell) {
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    if (board[i][j] === '.' && userBoard[i][j] === '.') {
                        for (let ch = '1'; ch <= '9'; ch++) {
                            if (possible(board, i, j, ch) && possibleForUser(board, userBoard, i, j, ch)) {
                                hintCell = { row: i, col: j };
                                hintValue = ch;
                                break;
                            }
                        }
                        if (hintCell) break;
                    }
                }
            }
        }
    
        if (hintCell) {
            const cell = document.querySelector(`input[data-row='${hintCell.row}'][data-col='${hintCell.col}']`);
            if (cell) {
                cell.value = hintValue;
                cell.style.color = 'blue';
                setTimeout(() => {
                    cell.value = '';
                    cell.style.color = 'black';
                }, 1000);
                startTime -= 20000;
            } else {
                console.error(`Cell not found for row: ${hintCell.row}, col: ${hintCell.col}`);
            }
        } else {
            console.error('No hint cell found');
        }
    }
    document.getElementById('show-solution').onclick = toggleSolution;
    document.getElementById('go-to-home').onclick = goToHome;
    document.getElementById('reset-game').onclick = resetGame;
    document.getElementById('get-hint').onclick = getHint;
    generateSudoku();
});
