const env = {
  fieldMinX: 0,
  fieldMinY: -10,
  fieldMaxX: 505,
  fieldMaxY: 425,
  tileWidth: 101,
  tileHeight: 85,
  tilesCountX: 5,
  tilesCountY: 6,
  currentScore: 0,
  highScoreHolder: document.querySelector('.high'),
  messageHolder: document.querySelector('.info'),
  welcomeMessage: "Let's go!",
  winMessage: 'You win!',
  loseMessage: 'You lose!',
  highScore: localStorage.getItem('highScore') ?? 0,
  currentScoreHolder: document.querySelector('.current'),
  updateScore: function (message) {
    this.currentScoreHolder.innerText = `Current score: ${this.currentScore}`;
    this.highScoreHolder.innerText = `High score: ${this.highScore}`;
    this.messageHolder.innerText = `${message}`;
  },
  incrementScore: function () {
    this.currentScore += 1;
    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore;
      localStorage.setItem('highScore', this.highScore);
    }
  },
  resetScore: function () {
    this.currentScore = 0;
  },
};

const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min) + min);

const directions = ['left', 'right'];

const getRandomDirection = () => directions[Math.floor(Math.random() * directions.length)];

class Player {
  constructor() {
    this.sprite = 'images/char-boy.png';
    this.currX = env.tileWidth * 2;
    this.currY = env.fieldMinY + env.tileHeight * 5;
    this.resetDelay = 1000;
  }

  update(newX = this.currX, newY = this.currY) {
    (this.currX = newX), (this.currY = newY);
    console.log(`x: ${this.currX}, y:${this.currY}`);
  }

  reset() {
    this.update(env.tileWidth * 2, env.tileHeight * 5);
  }

  render() {
    ctx.drawImage(Resources.get(this.sprite), this.currX, this.currY);
  }

  handleInput(code) {
    switch (code) {
      case 'ArrowLeft':
        if (this.currX - env.tileWidth < env.fieldMinX) return;
        this.currX -= env.tileWidth;
        break;
      case 'ArrowRight':
        if (this.currX + env.tileWidth >= env.fieldMaxX) return;
        this.currX += env.tileWidth;
        break;
      case 'ArrowUp':
        if (this.currY - env.tileHeight < env.fieldMinY) return;
        this.currY -= env.tileHeight;
        break;
      case 'ArrowDown':
        if (this.currY + env.tileHeight >= env.fieldMaxY) return;
        this.currY += env.tileHeight;
        break;
      default:
        break;
    }
    this.update(this.currX, this.currY);
    if (this.currY === -6) {
      env.incrementScore();
      env.updateScore(env.winMessage);
      setTimeout(() => {
        player.update(this.startX, this.startY);
        env.updateScore(env.welcomeMessage);
      }, this.resetDelay);
    }
  }
}

const player = new Player();

class Enemy {
  constructor(startY, mult, player) {
    this.direction = getRandomDirection();
    this.sprite = `images/enemy-bug-${this.direction}.png`;
    this.minX = -env.tileWidth;
    this.maxX = env.width + env.tileWidth;
    this.startX = this.direction === 'right' ? this.minX : this.maxX;
    this.startY = startY;
    this.currX = this.startX;
    this.currY = this.startY;
    this.mult = this.direction === 'right' ? mult : -mult;
    this.player = player;
  }
  checkCollision() {
    if (
      this.player.currX >= this.currX &&
      this.player.currX <= this.currX + env.tileWidth &&
      this.player.currY >= this.currY &&
      this.player.currY <= this.currY + 85
    ) {
      return true;
    }
    return false;
  }
  update(dt) {
    if (this.checkCollision()) {
      env.resetScore();
      env.updateScore(env.loseMessage);
      setTimeout(() => {
        this.player.updateScore(player.startX, player.startY);
        env.updateScore(env.welcomeMessage);
      }, 1000);
      this.player.updateScore(player.startX, player.startY);
    }
    if (this.currX >= this.maxX) {
      this.mult *= -1;
      this.direction = 'left';
      this.sprite = `images/enemy-bug-${this.direction}.png`;
    } else if (this.currX <= this.minX) {
      this.mult *= -1;
      this.direction = 'right';
      this.sprite = `images/enemy-bug-${this.direction}.png`;
    }
    this.currX = this.currX + dt * this.mult;
  }
  render() {
    ctx.drawImage(Resources.get(this.sprite), this.currX, this.currY);
  }
}

const allEnemies = [
  new Enemy(env.tileHeight, getRandomNumber(env.minEnemySpeed, env.maxEnemySpeed), player),
  new Enemy(env.tileHeight * 2, getRandomNumber(env.minEnemySpeed, env.maxEnemySpeed), player),
  new Enemy(env.tileHeight * 3, getRandomNumber(env.minEnemySpeed, env.maxEnemySpeed), player),
];

document.addEventListener('keyup', function (e) {
  const allowedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  if (allowedKeys.includes(e.code)) player.handleInput(e.code);
});

document.addEventListener('DOMContentLoaded', () => {
  env.updateScore(env.welcomeMessage);
  console.log(player);
  console.log(env);
  allEnemies.forEach(enemy => console.log(enemy));
});
