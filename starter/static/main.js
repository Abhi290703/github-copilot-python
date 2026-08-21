let currentBoard = [];
let initialBoard = [];
let timerInterval = null;
let secondsElapsed = 0;
let hintsUsed = 0;
let currentDifficulty = 'medium';

const boardElement = document.getElementById('sudoku-board');
const timerElement = document.getElementById('timer');
const difficultySelect = document.getElementById('difficulty');
const newGameBtn = document.getElementById('new-game');
const checkBtn = document.getElementById('check-solution');
const hintBtn = document.getElementById('hint-button');
const themeToggleBtn = document.getElementById('toggle-theme');
const leaderboardBody = document.getElementById('leaderboard-body');

// 1. Theme Management
themeToggleBtn.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  themeToggleBtn.textContent = next === 'dark' ? '🌙' : '☀️';
});

// 2. Timer Functions
function startTimer() {
  clearInterval(timerInterval);
  secondsElapsed = 0;
  timerInterval = setInterval(() => {
    secondsElapsed++;
    const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
    const secs = String(secondsElapsed % 60).padStart(2, '0');
    timerElement.textContent = `${mins}:${secs}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

// 3. New Game Initialization
async function startNewGame() {
  currentDifficulty = difficultySelect.value;
  hintsUsed = 0;
  startTimer();

  const response = await fetch(`/new?difficulty=${currentDifficulty}`);
  const data = await response.json();
  initialBoard = data.puzzle;
  currentBoard = JSON.parse(JSON.stringify(data.puzzle));
  
  renderBoard();
}

// 4. Render Board with Alternating 3x3 Shading
function renderBoard() {
  boardElement.innerHTML = '';
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.dataset.row = r;
      input.dataset.col = c;
      input.className = 'cell';

      // 3x3 box alternating color pattern
      const boxRow = Math.floor(r / 3);
      const boxCol = Math.floor(c / 3);
      if ((boxRow + boxCol) % 2 === 1) {
        input.classList.add('alt-box');
      }

      const val = currentBoard[r][c];
      if (initialBoard[r][c] !== 0) {
        input.value = val;
        input.readOnly = true;
        input.classList.add('prefilled');
      } else if (val !== 0) {
        input.value = val;
      }

      input.addEventListener('input', (e) => handleCellInput(e, r, c));
      boardElement.appendChild(input);
    }
  }
  validateLiveConflicts();
}

// 5. Real-Time Input & Conflicts
function handleCellInput(e, r, c) {
  const val = e.target.value;
  if (!/^[1-9]$/.test(val)) {
    e.target.value = '';
    currentBoard[r][c] = 0;
  } else {
    currentBoard[r][c] = parseInt(val, 10);
  }
  e.target.classList.remove('error');
  validateLiveConflicts();
}

function validateLiveConflicts() {
  document.querySelectorAll('.cell').forEach(c => c.classList.remove('conflict'));

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = currentBoard[r][c];
      if (val === 0) continue;

      for (let x = 0; x < 9; x++) {
        // Row conflict
        if (x !== c && currentBoard[r][x] === val) markConflict(r, c, r, x);
        // Column conflict
        if (x !== r && currentBoard[x][c] === val) markConflict(r, c, x, c);
      }

      // Box conflict
      const startR = r - (r % 3);
      const startC = c - (c % 3);
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const checkR = startR + i;
          const checkC = startC + j;
          if ((checkR !== r || checkC !== c) && currentBoard[checkR][checkC] === val) {
            markConflict(r, c, checkR, checkC);
          }
        }
      }
    }
  }
}

function markConflict(r1, c1, r2, c2) {
  getCellElement(r1, c1)?.classList.add('conflict');
  getCellElement(r2, c2)?.classList.add('conflict');
}

function getCellElement(r, c) {
  return document.querySelector(`.cell[data-row='${r}'][data-col='${c}']`);
}

// 6. Check Solution
checkBtn.addEventListener('click', async () => {
  const res = await fetch('/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ board: currentBoard })
  });
  const data = await res.json();

  document.querySelectorAll('.cell').forEach(c => c.classList.remove('error'));

  if (data.incorrect && data.incorrect.length > 0) {
    data.incorrect.forEach(([r, c]) => {
      getCellElement(r, c)?.classList.add('error');
    });
  } else if (data.solved) {
    stopTimer();
    const name = prompt(`Congratulations! You solved it in ${timerElement.textContent}. Enter your name:`) || 'Player';
    saveScore(name, timerElement.textContent, currentDifficulty, hintsUsed);
    renderLeaderboard();
  }
});

// 7. Hint Button
hintBtn.addEventListener('click', async () => {
  const res = await fetch('/hint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ board: currentBoard })
  });
  const data = await res.json();

  if (data.row !== undefined && data.col !== undefined) {
    const { row, col, value } = data;
    currentBoard[row][col] = value;
    hintsUsed++;
    
    const cell = getCellElement(row, col);
    if (cell) {
      cell.value = value;
      cell.readOnly = true;
      cell.classList.remove('error', 'conflict');
      cell.classList.add('hint-locked');
    }
    validateLiveConflicts();
  }
});

// 8. Leaderboard & LocalStorage
function saveScore(name, time, level, hints) {
  const scores = JSON.parse(localStorage.getItem('sudoku_scores') || '[]');
  scores.push({ name, time, level, hints, rawSeconds: secondsElapsed });
  scores.sort((a, b) => a.rawSeconds - b.rawSeconds);
  localStorage.setItem('sudoku_scores', JSON.stringify(scores.slice(0, 10)));
}

function renderLeaderboard() {
  const scores = JSON.parse(localStorage.getItem('sudoku_scores') || '[]');
  leaderboardBody.innerHTML = '';
  scores.forEach((entry, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${entry.name}</td>
      <td>${entry.time}</td>
      <td>${entry.level}</td>
      <td>${entry.hints}</td>
    `;
    leaderboardBody.appendChild(tr);
  });
}

// Event Listeners
newGameBtn.addEventListener('click', startNewGame);

// Initial bootstrap
startNewGame();
renderLeaderboard();