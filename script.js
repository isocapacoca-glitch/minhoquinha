
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const message = document.getElementById('message');
const messageTitle = document.getElementById('message-title');
const messageText = document.getElementById('message-text');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');

const tile = 20;
const tiles = canvas.width / tile;

let snake, food, direction, nextDirection;
let score, best, timer, running, paused;

best = Number(localStorage.getItem('minhoquinha-recorde') || 0);
bestEl.textContent = best;

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];

  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };

  score = 0;
  scoreEl.textContent = score;

  placeFood();

  running = false;
  paused = false;

  clearInterval(timer);

  pauseBtn.textContent = '⏸ Pausar';
  pauseBtn.disabled = true;

  draw();
}

function placeFood() {
  do {
    food = {
      x: Math.floor(Math.random() * tiles),
      y: Math.floor(Math.random() * tiles)
    };
  } while (
    snake.some(part => part.x === food.x && part.y === food.y)
  );
}

function drawBoard() {
  ctx.fillStyle = '#dff3d8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#cce5c4';
  ctx.lineWidth = 1;

  for (let i = 0; i <= tiles; i++) {
    ctx.beginPath();
    ctx.moveTo(i * tile, 0);
    ctx.lineTo(i * tile, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * tile);
    ctx.lineTo(canvas.width, i * tile);
    ctx.stroke();
  }
}

function draw() {
  drawBoard();

  ctx.font = '18px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillText(
    '🍎',
    food.x * tile + tile / 2,
    food.y * tile + tile / 2 + 1
  );

  snake.forEach((part, index) => {
    const inset = index === 0 ? 1 : 2;

    ctx.fillStyle = index === 0 ? '#238b55' : '#43bd78';

    ctx.beginPath();
    ctx.roundRect(
      part.x * tile + inset,
      part.y * tile + inset,
      tile - inset * 2,
      tile - inset * 2,
      6
    );
    ctx.fill();

    if (index === 0) {
      ctx.fillStyle = '#fff';

      const eyeX = part.x * tile +
        (direction.x === -1 ? 5 : direction.x === 1 ? 14 : 7);

      const eyeY = part.y * tile +
        (direction.y === -1 ? 5 : direction.y === 1 ? 14 : 7);

      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(
        part.x * tile + (direction.x === -1 ? 5 : direction.x === 1 ? 14 : 13),
        part.y * tile + (direction.y === -1 ? 5 : direction.y === 1 ? 14 : 7),
        2.2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  });
}

function startGame() {
  if (running && !paused) return;

  if (paused) {
    paused = false;
    running = true;
    pauseBtn.textContent = '⏸ Pausar';
    message.classList.add('hidden');

    timer = setInterval(tick, Math.max(65, 145 - score * 2));
    return;
  }

  resetGame();

  running = true;
  pauseBtn.disabled = false;
  message.classList.add('hidden');

  timer = setInterval(tick, 145);
}

function endGame() {
  running = false;
  paused = false;

  clearInterval(timer);
  pauseBtn.disabled = true;

  messageTitle.textContent = 'Fim de jogo!';

  messageText.textContent =
    `Você fez ${score} ponto${score === 1 ? '' : 's'}. Que tal tentar de novo?`;

  startBtn.textContent = 'Jogar novamente';
  message.classList.remove('hidden');
}

function tick() {
  direction = nextDirection;

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  const eating = head.x === food.x && head.y === food.y;

  const bodyToCheck = eating ? snake : snake.slice(0, -1);

  if (
    head.x < 0 ||
    head.x >= tiles ||
    head.y < 0 ||
    head.y >= tiles ||
    bodyToCheck.some(part => part.x === head.x && part.y === head.y)
  ) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (eating) {
    score++;
    scoreEl.textContent = score;

    if (score > best) {
      best = score;
      bestEl.textContent = best;

      localStorage.setItem('minhoquinha-recorde', best);
    }

    placeFood();

    clearInterval(timer);
    timer = setInterval(tick, Math.max(65, 145 - score * 2));
  } else {
    snake.pop();
  }

  draw();
}

function changeDirection(dir) {
  const directions = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };

  const candidate = directions[dir];

  if (!candidate) return;

  if (
    candidate.x === -direction.x &&
    candidate.y === -direction.y
  ) return;

  nextDirection = candidate;

  if (!running && !paused) {
    startGame();
  }
}

document.addEventListener('keydown', event => {
  const keys = {
    ArrowUp: 'up',
    w: 'up',
    W: 'up',

    ArrowDown: 'down',
    s: 'down',
    S: 'down',

    ArrowLeft: 'left',
    a: 'left',
    A: 'left',

    ArrowRight: 'right',
    d: 'right',
    D: 'right'
  };

  if (keys[event.key]) {
    event.preventDefault();
    changeDirection(keys[event.key]);
  } else if (event.code === 'Space') {
    event.preventDefault();

    if (!running && !paused) {
      startGame();
    } else {
      togglePause();
    }
  }
});

document.querySelectorAll('[data-dir]').forEach(button => {
  button.addEventListener('click', () => {
    changeDirection(button.dataset.dir);
  });
});

function togglePause() {
  if (!running && !paused) return;

  if (paused) {
    startGame();
  } else {
    paused = true;
    running = false;

    clearInterval(timer);

    pauseBtn.textContent = '▶ Continuar';

    messageTitle.textContent = 'Jogo pausado';
    messageText.textContent = 'Continue quando quiser!';

    startBtn.textContent = 'Continuar';

    message.classList.remove('hidden');
  }
}

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);

restartBtn.addEventListener('click', () => {
  resetGame();

  messageTitle.textContent = 'Pronto para jogar?';
  messageText.textContent =
    'Use as setas do teclado ou WASD para controlar a minhoquinha.';

  startBtn.textContent = 'Começar jogo';

  message.classList.remove('hidden');
});

resetGame();

