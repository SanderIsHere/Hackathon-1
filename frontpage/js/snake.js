document.addEventListener("DOMContentLoaded", () => {
    const playBoard = document.querySelector(".play-board");
    const scoreElement = document.querySelector(".score");
    const highScoreElement = document.querySelector(".high-score");
    const controls = document.querySelectorAll(".controls i");
    const startBtn = document.getElementById("start-btn");
    const retryBtn = document.getElementById("retry-btn");
    const gameOverScreen = document.getElementById("game-over-screen");
    const finalScoreElement = document.getElementById("finalScore");
  
    const speedSlider = document.getElementById("speedSlider");
    const speedValueElement = document.getElementById("speedValue");
  
    let gameOver = false;
    let foodX, foodY;
    let snakeX = 15, snakeY = 15;
    let velocityX = 0, velocityY = 0;
    let snakeBody = [];
    let setIntervalId;
    let score = 0;
    let gameStarted = false;
  
    function getSpeed() {
        return speedSlider ? (parseInt(speedSlider.value, 10) || 120) : 120;
    }
  
    function updateSpeedValueText() {
        if (speedValueElement && speedSlider) {
            speedValueElement.textContent = `${speedSlider.value} ms`;
        }
    }
  
    if (speedSlider) {
        speedSlider.addEventListener("input", function() {
            updateSpeedValueText();
            if (gameStarted && !gameOver) {
                clearInterval(setIntervalId);
                setIntervalId = setInterval(initGame, getSpeed());
            }
        });
        updateSpeedValueText();
    }
  
  
    let highScore = localStorage.getItem("snake-high-score") || 0;
    highScoreElement.innerText = `Skor Tertinggi: ${highScore}`;
  
  
    function updateFoodPosition() {
        foodX = Math.floor(Math.random() * 30) + 1;
        foodY = Math.floor(Math.random() * 30) + 1;
        for (let i = 0; i < snakeBody.length; i++) {
            if (foodX === snakeBody[i][0] && foodY === snakeBody[i][1]) {
                updateFoodPosition();
                return;
            }
        }
    }
  
    function handleGameOver() {
        clearInterval(setIntervalId);
        gameStarted = false;
        finalScoreElement.textContent = `Skor Akhir: ${score}`;
        gameOverScreen.style.display = "flex";
    }
  
    function changeDirection(e) {
        if (!gameStarted && e.key !== "Enter" && e.key !== " ") return;
  
        if (!gameStarted && (e.key === "Enter" || e.key === " ")) {
            startGameLogic();
            return;
        }
        if (!gameStarted) return;
  
        const key = e.key;
        if ((key === "ArrowUp" || key.toLowerCase() === "w") && velocityY !== 1) {
            velocityX = 0;
            velocityY = -1;
        } else if ((key === "ArrowDown" || key.toLowerCase() === "s") && velocityY !== -1) {
            velocityX = 0;
            velocityY = 1;
        } else if ((key === "ArrowLeft" || key.toLowerCase() === "a") && velocityX !== 1) {
            velocityX = -1;
            velocityY = 0;
        } else if ((key === "ArrowRight" || key.toLowerCase() === "d") && velocityX !== -1) {
            velocityX = 1;
            velocityY = 0;
        }
    }
  
    controls.forEach(button => {
        button.addEventListener("click", () => {
            if (!gameStarted) return;
            changeDirection({ key: button.dataset.key });
        });
    });
  
    function initGame() {
        if (gameOver) {
            return handleGameOver();
        }
  
        let html = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;
  
        if (snakeX === foodX && snakeY === foodY) {
            updateFoodPosition();
            snakeBody.push([foodX, foodY]);
            score++;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem("snake-high-score", highScore);
            }
            scoreElement.innerText = `Skor: ${score}`;
            highScoreElement.innerText = `Skor Tertinggi: ${highScore}`;
        }
  
        for (let i = snakeBody.length - 1; i > 0; i--) {
            snakeBody[i] = [...snakeBody[i - 1]];
        }
  
        snakeX += velocityX;
        snakeY += velocityY;
  
        if (snakeBody.length > 0) {
            snakeBody[0] = [snakeX, snakeY];
        } else {
            if (velocityX !== 0 || velocityY !== 0) {
                snakeBody.push([snakeX, snakeY]);
            }
        }
  
  
        if (snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
            gameOver = true;
            return;
        }
  
        for (let i = 0; i < snakeBody.length; i++) {
            if (snakeBody[i]) {
                let segmentClass = (i === 0) ? "head" : "body";
                html += `<div class="${segmentClass}" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
  
                if (i !== 0 && snakeBody[0] && snakeBody[0][0] === snakeBody[i][0] && snakeBody[0][1] === snakeBody[i][1]) {
                    gameOver = true;
                }
            }
        }
        playBoard.innerHTML = html;
    }
  
    function startGameLogic() {
        gameOver = false;
        gameStarted = true;
        snakeX = 15;
        snakeY = 15;
        velocityX = 0;
        velocityY = 0;
        snakeBody = [[snakeX, snakeY]];
        score = 0;
  
        scoreElement.innerText = `Skor: ${score}`;
        highScore = localStorage.getItem("snake-high-score") || 0;
        highScoreElement.innerText = `Skor Tertinggi: ${highScore}`;
  
        gameOverScreen.style.display = "none";
        startBtn.style.display = "none";
  
        updateFoodPosition();
        updateSpeedValueText();
  
        if (setIntervalId) {
            clearInterval(setIntervalId);
        }
        setIntervalId = setInterval(initGame, getSpeed());
    }
  
    startBtn.addEventListener("click", startGameLogic);
    retryBtn.addEventListener("click", startGameLogic);
    document.addEventListener("keydown", changeDirection);
  });