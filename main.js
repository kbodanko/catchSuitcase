const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const backgroundImage = new Image();
backgroundImage.src = 'chuteBg.png';

let level = 1;
let backgroundSpeed = 1; // Prędkość przesuwania tła
let objectSpeed = 2; // Prędkość spadania obiektów
let objectIntervalBase = 1000; // Częstotliwość generowania obiektów (w milisekundach)
let objectInterval = objectIntervalBase;

let backgroundPosition = 0; // Początkowa pozycja tła

function drawBackground() {
  ctx.drawImage(backgroundImage, 0, backgroundPosition, canvas.width, canvas.height);
  ctx.drawImage(backgroundImage, 0, backgroundPosition - (canvas.height - 2), canvas.width, canvas.height);
  backgroundPosition += backgroundSpeed;

  // Jeśli tło przesunęło się o pełną wysokość canvasa, resetujemy pozycję
  if (backgroundPosition >= canvas.height) {
    backgroundPosition = 0;
  }
}

const player = {
  x: canvas.width / 2,
  y: canvas.height - 50,
  width: 600,
  height: 20,
  dx: 2,
};

const objects = [];

function drawPlayer() {
  ctx.fillStyle = '#FA511E';
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function clearScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function updatePlayer() {
  if (rightPressed && player.x < canvas.width - player.width) {
    player.x += 20;
  }

  if (leftPressed && player.x > 0) {
    player.x -= 20;
  }
}

let rightPressed = false;
let leftPressed = false;

document.addEventListener('keydown', function (event) {
  if (event.key == 'Right' || event.key == 'ArrowRight') {
    rightPressed = true;
  } else if (event.key == 'Left' || event.key == 'ArrowLeft') {
    leftPressed = true;
  }
}, false);

document.addEventListener('keyup', function (event) {
  if (event.key == 'Right' || event.key == 'ArrowRight') {
    rightPressed = false;
  } else if (event.key == 'Left' || event.key == 'ArrowLeft') {
    leftPressed = false;
  }
}, false);

let caughtCount = 0;
let droppedCount = 0;
let heartIcons = [];
const heartContainer = document.getElementById('heartContainer');

function createHeartIcons() {
    for (let i = 0; i < 5; i++) {
      let heartIcon = document.createElement('img');
      heartIcon.src = 'heart.png';
      heartIcon.classList.add('heart-icon');
      heartIcons.push(heartIcon);
      heartContainer.appendChild(heartIcon);
    }
  }
function detectCollision(object, player) {
  if (
    object.x < player.x + player.width &&
    object.x + object.width > player.x &&
    object.y < player.y + 50 &&
    object.y + object.height > player.y
  ) {
    if (object.image.src.includes('heart.png')) {
        let heartIcon = document.createElement('img');
      heartIcon.src = 'heart.png';
      heartIcon.classList.add('heart-icon');
      heartIcons.push(heartIcon); // Dodaj nowe serce do heartIcons
      heartContainer.appendChild(heartIcon);

    }
    return true;
  }
  return false;
}

let maxObjects = 6; // Maksymalna liczba obiektów na ekranie
let objectCounter = 0; // Licznik utworzonych obiektów
function createObject() {
    if (objects.length < maxObjects) { // Sprawdź, czy liczba obiektów nie przekroczyła limitu
      const object = {
        x: Math.random() * (canvas.width - 100),
        y: 0,
        width: 50,
        height: 50,
        image: new Image(),
        velocityY: objectSpeed + (level * 0.1) + Math.random() * 2 // Losowa prędkość spadania obiektu
      };
      object.image.src = 'suitcase.png';
      if (objectCounter % 10 !== 0 || objectCounter === 0) {
          object.image.src = 'suitcase.png'; // Obrazek walizki
    } else {
          object.image.src = 'heart.png'; // Obrazek serca
          object.height = 35;
      }
    
      objectCounter++;
      objects.push(object);
    }
    else {maxObjects += 0.0001}
  }

function updateObject(object) {
    object.y += object.velocityY; // Użyj pola velocityY zamiast objectSpeed
}

function drawObject(object) {
  const imageWidth = object.width * (canvas.width / 500); // Ustawienie proporcjonalnej szerokości obrazka
  const imageHeight = object.height * 0.5 * (canvas.width / 500); // Ustawienie proporcjonalnej wysokości obrazka

  ctx.drawImage(object.image, object.x, object.y, imageWidth, imageHeight);
}

function removeObjects() {
  for (let i = objects.length - 1; i >= 0; i--) {
    if (objects[i].y + objects[i].height > canvas.height) {
      objects.splice(i, 1);
      dropHeart();
    }
  }
}

function dropHeart() {
  if (heartIcons.length > 0) {
    console.log(heartIcons)
    heartContainer.removeChild(heartIcons[0]);
    heartIcons.shift();
  }

  if (heartIcons.length === 0) {
    gameOver();
  }
}

function gameOver() {
  isGameRunning = false; // Ustaw flagę isGameRunning na false, aby zatrzymać animację
  cancelAnimationFrame(animationId);
  gameOverElement.style.display = 'flex';
  refreshIcon.style.display = 'flex';

}
function updateLevel() {
    // if (caughtCount >= 30) {
      level++;
      objectSpeed += 1; // Zwiększ prędkość spadania obiektów o 1
      caughtCount = 0; // Zresetuj licznik złapanych obiektów
      updateObjectInterval(); // Aktualizuj interwał generowania obiektów
    // }
  }
function increaseLevel() {
  level++;
  caughtCount = 0
  levelElement.textContent = `Level: ${level}`;
  backgroundSpeed += 0.1; // Zwiększ prędkość przesuwania tła o 0.1 dla każdego poziomu
  objectSpeed += 0.001; // Zwiększ prędkość spadania obiektów o 0.1 dla każdego poziomu
  objectInterval -= 1; // Zmniejsz częstotliwość generowania obiektów o 100 ms dla każdego poziomu
  updateObjectInterval();
}

function animate() {
  console.log(isGameRunning)
    if (!isGameRunning) {
        return; // Zatrzymaj animację, jeśli flaga isGameRunning jest ustawiona na false
      }
  clearScreen();
  drawBackground();

  removeObjects();

  for (let i = 0; i < objects.length; i++) {
    let object = objects[i];

    drawObject(object);
    updateObject(object);

    if (detectCollision(object, player)) {
      caughtCount++;
      objects.splice(i, 1);
    }
  }

  drawPlayer();
  updatePlayer();
  
  
  if (caughtCount >= 3) {
    increaseLevel();
    caughtCount = 0;
}

animationId = requestAnimationFrame(animate);
}
let animationId;
let isGameRunning = true;
backgroundImage.onload = function () {
    animate();
};
// updateLevel()

const gameOverElement = document.createElement('div');
gameOverElement.classList.add('game-over');
gameOverElement.textContent = 'GAME OVER';
document.querySelector('.wrapper').appendChild(gameOverElement);

const refreshIcon = document.createElement('img');
refreshIcon.src = 'refresh.png';
refreshIcon.classList.add('refresh_icon');
gameOverElement.appendChild(refreshIcon);

// gameOverElement.addEventListener('click', restartGame())
refreshIcon.addEventListener('click', restartGame);

function restartGame() {
  isGameRunning=true
  console.log('restart')
  gameOverElement.style.display = 'none';
  refreshIcon.style.display = 'none';
  resetGame();
  animate();
  updateObjectInterval();
  

}
const levelElement = document.querySelector('#level');
levelElement.textContent = "Level " + level;
function resetGame() {
  caughtCount = 0;
  droppedCount = 0;
  level = 1;
  objects.length = 0;
  heartContainer.innerHTML = '';
//   createHeartIcons();
  updateObjectInterval();
  createHeartIcons()

}

createHeartIcons()

function updateObjectInterval() {
  clearInterval(objectInterval);
  objectInterval = setInterval(createObject, objectIntervalBase - (level * 50));
}

// createHeartIcons();
updateObjectInterval();
