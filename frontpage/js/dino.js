const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const gameOverMessage = document.getElementById('gameOverMessage');

const groundY = canvas.height - 20;
const dinoWidth = 25;
const dinoHeight = 30;
const dinoBottomMargin = 5;

let dinoX = 50;
let dinoY = groundY - dinoHeight - dinoBottomMargin;
let dinoSpeedY = 0;
let gravity = 0.6;
let jumpPower = -10;
let isJumping = false;
let dinoLeg = 0;

let obstacles = [];
let baseObstacleSpeed = 3.5;
let obstacleSpeed = baseObstacleSpeed;

const gachaObstacle = [6, 40, 60, 80, 100];


let tampungan = 0
function getRandomObstacleInterval() {
    let randomIndex = Math.floor(Math.random() * gachaObstacle.length);
    if(tampungan === randomIndex && tampungan === 0){
        return 30
    }
    tampungan = randomIndex

    return gachaObstacle[randomIndex];
}

let timeToNextObstacle = getRandomObstacleInterval();

let clouds = [];
let cloudSpeed = 0.5;
let timeToNextCloud = 200;

let score = 0;
let frameCount = 0;
let gameActive = true;
let animationFrameId;

function drawGround() {
    ctx.fillStyle = '#8b7e66';
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
    ctx.strokeStyle = '#6b5e46';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY + 1);
    ctx.lineTo(canvas.width, groundY + 1);
    ctx.stroke();
}

function drawDino() {
    ctx.fillStyle = '#556B2F';
    let legOffset = 0;
    if (!isJumping) {
        legOffset = (Math.floor(frameCount / 8) % 2 === 0) ? 0 : -5;
    }

    ctx.fillRect(dinoX, dinoY, dinoWidth, dinoHeight + legOffset);
    ctx.fillStyle = 'white';
    ctx.fillRect(dinoX + dinoWidth * 0.6, dinoY + dinoHeight * 0.2, 5, 5);
    ctx.fillStyle = 'black';
    ctx.fillRect(dinoX + dinoWidth * 0.7, dinoY + dinoHeight * 0.3, 2, 2);
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.fillStyle = '#006400';
        let baseY = groundY - obstacle.height;
        ctx.fillRect(obstacle.x, baseY, obstacle.width, obstacle.height);
        ctx.fillRect(obstacle.x - 2, baseY + 5, obstacle.width + 4, 3);
        ctx.fillRect(obstacle.x + obstacle.width / 2 - 1.5, baseY - 5, 3, 5);
    });
}

function drawClouds() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    clouds.forEach(cloud => {
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.size * 0.8, cloud.y, cloud.size * 1.2, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.size * 1.8, cloud.y, cloud.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    });
}

function updateScoreDisplay() {
    score = Math.floor(frameCount / 5);
    scoreDisplay.textContent = `SCORE: ${score}`;
}

function updateDino() {
    if (isJumping || dinoY < groundY - dinoHeight - dinoBottomMargin) {
        dinoSpeedY += gravity;
        dinoY += dinoSpeedY;
    }
    if (dinoY >= groundY - dinoHeight - dinoBottomMargin) {
        dinoY = groundY - dinoHeight - dinoBottomMargin;
        dinoSpeedY = 0;
        isJumping = false;
    }
}

function spawnObstacle() {
    timeToNextObstacle--;
    if (timeToNextObstacle <= 0) {
        let cactusHeight = 25 + Math.random() * 25;
        let cactusWidth = 15 + Math.random() * 10;
        obstacles.push({
            x: canvas.width,
            width: cactusWidth,
            height: cactusHeight
        });
        timeToNextObstacle = getRandomObstacleInterval();
    }
}

function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= obstacleSpeed;
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
        }
    }
}

function spawnClouds() {
    timeToNextCloud--;
    if (timeToNextCloud <= 0) {
        clouds.push({
            x: canvas.width,
            y: 20 + Math.random() * 40,
            size: 10 + Math.random() * 10
        });
        timeToNextCloud = 150 + Math.random() * 200;
    }
}

function updateClouds() {
    for (let i = clouds.length - 1; i >= 0; i--) {
        clouds[i].x -= cloudSpeed;
        if (clouds[i].x + clouds[i].size * 3 < 0) {
            clouds.splice(i, 1);
        }
    }
}

function checkCollisions() {
    const dinoTop = dinoY;
    const dinoBottom = dinoY + dinoHeight;
    const dinoLeft = dinoX;
    const dinoRight = dinoX + dinoWidth;

    for (const obs of obstacles) {
        const obsTop = groundY - obs.height;
        const obsBottom = groundY;
        const obsLeft = obs.x;
        const obsRight = obs.x + obs.width;

        if (
            dinoRight > obsLeft &&
            dinoLeft < obsRight &&
            dinoBottom > obsTop &&
            dinoTop < obsBottom
        ) {
            return true;
        }
    }
    return false;
}

function gameLoop() {
    if (!gameActive) return;

    frameCount++;
    obstacleSpeed = baseObstacleSpeed + Math.floor(score / 50) * 0.25;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    spawnClouds();
    updateClouds();
    drawClouds();
    drawGround();

    updateDino();
    spawnObstacle();
    updateObstacles();

    drawDino();
    drawObstacles();

    updateScoreDisplay();

    if (checkCollisions()) {
        gameActive = false;
        gameOverMessage.style.display = 'flex';
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        return;
    }

    animationFrameId = requestAnimationFrame(gameLoop);
}

function jump() {
    if (!isJumping && dinoY >= groundY - dinoHeight - dinoBottomMargin - 1) {
        dinoSpeedY = jumpPower;
        isJumping = true;
    }
}

function resetGame() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    gameOverMessage.style.display = 'none';

    dinoY = groundY - dinoHeight - dinoBottomMargin;
    dinoSpeedY = 0;
    isJumping = false;
    obstacles = [];
    clouds = [];
    score = 0;
    frameCount = 0;
    obstacleSpeed = baseObstacleSpeed;
    timeToNextObstacle = getRandomObstacleInterval();
    timeToNextCloud = 200;
    gameActive = true;

    updateScoreDisplay();
    gameLoop();
}

const audio = document.getElementById('game-audio');
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
        if (gameActive) {
            jump();
            audio.play()

        } else {
            resetGame();
        }
    }
});


  

gameLoop();