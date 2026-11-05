
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const box = 20;

let snake;
let food;
let direction;
let nextDirection;
let score;
let gameOver;
let gameLoop;

function createFood() {
    let position;

    do {
        position = {
            x: Math.floor(Math.random() * 20) * box,
            y: Math.floor(Math.random() * 20) * box
        };
    } while (snake.some(part =>
        part.x === position.x && part.y === position.y
    ));

    return position;
}

function restartGame() {
    snake = [
        { x: 200, y: 200 },
        { x: 180, y: 200 },
        { x: 160, y: 200 }
    ];

    direction = "RIGHT";
    nextDirection = "RIGHT";
    score = 0;
    gameOver = false;

    food = createFood();

    document.getElementById("score").textContent = score;
    document.getElementById("message").textContent = "Boa sorte!";

    clearInterval(gameLoop);
    gameLoop = setInterval(draw, 120);
}

document.addEventListener("keydown", function(event) {
    const keys = {
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT",
        w: "UP",
        s: "DOWN",
        a: "LEFT",
        d: "RIGHT"
    };

    const newDirection = keys[event.key];

    if (!newDirection) return;

    event.preventDefault();

    if (
        (newDirection === "UP" && direction !== "DOWN") ||
        (newDirection === "DOWN" && direction !== "UP") ||
        (newDirection === "LEFT" && direction !== "RIGHT") ||
        (newDirection === "RIGHT" && direction !== "LEFT")
    ) {
        nextDirection = newDirection;
    }
});

function draw() {
    if (gameOver) return;

    direction = nextDirection;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar fruta
    ctx.fillStyle = "#ff4444";
    ctx.beginPath();
    ctx.arc(food.x + 10, food.y + 10, 9, 0, Math.PI * 2);
    ctx.fill();

    // Movimentar minhoquinha
    const head = { ...snake[0] };

    if (direction === "UP") head.y -= box;
    if (direction === "DOWN") head.y += box;
    if (direction === "LEFT") head.x -= box;
    if (direction === "RIGHT") head.x += box;

    // Verificar colisão
    const eating =
        head.x === food.x && head.y === food.y;

    const body = eating ? snake : snake.slice(0, -1);

    const hitWall =
        head.x < 0 ||
        head.y < 0 ||
        head.x >= canvas.width ||
        head.y >= canvas.height;

    const hitSnake = body.some(part =>
        part.x === head.x && part.y === head.y
    );

    if (hitWall || hitSnake) {
        gameOver = true;
        clearInterval(gameLoop);
        document.getElementById("message").textContent =
            "💀 Game Over! Pontuação: " + score;
        return;
    }

    snake.unshift(head);

    // Comer fruta
    if (eating) {
        score++;
        document.getElementById("score").textContent = score;
        food = createFood();
    } else {
        snake.pop();
    }

    // Desenhar minhoquinha
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? "#aaff00" : "#00cc66";

        ctx.fillRect(
            part.x + 1,
            part.y + 1,
            box - 2,
            box - 2
        );
    });
}

restartGame();

function changeDirection(newDirection) {
    if (
        (newDirection === "UP" && direction !== "DOWN") ||
        (newDirection === "DOWN" && direction !== "UP") ||
        (newDirection === "LEFT" && direction !== "RIGHT") ||
        (newDirection === "RIGHT" && direction !== "LEFT")
    ) {
        nextDirection = newDirection;
    }
}
