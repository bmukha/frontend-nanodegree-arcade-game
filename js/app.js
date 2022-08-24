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
  isGameActive: true,
  highScoreHolder: document.querySelector('.high'),
  messageHolder: document.querySelector('.info'),
  welcomeMessage: "Let's go!",
  winMessage: 'You win!',
  loseMessage: 'You lose!',
  highScore: localStorage.getItem('highScore') ?? 0,
  currentScoreHolder: document.querySelector('.current'),
  updateGameInfo: function (message) {
    this.currentScoreHolder.innerText = `Current score: ${this.currentScore}`;
    this.highScoreHolder.innerText = `High score: ${this.highScore}`;
    this.messageHolder.innerText = `${message}`;
  },
  incrementScore: function () {
    this.currentScore += 1;
    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore;
      this.saveHighScore(this.highScore);
    }
  },
  saveHighScore: function (score) {
    localStorage.setItem('highScore', score);
  },
  resetScore: function (resetHighScore = false) {
    if (resetHighScore) {
      this.highScore = 0;
      this.saveHighScore();
    }
    this.currentScore = 0;
  },
};

const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min) + min);

const directions = ['left', 'right'];

const getRandomDirection = () => directions[Math.floor(Math.random() * directions.length)];

class Player {
  constructor() {
    this.sprite = 'images/char-boy.png';
    this.startX = env.tileWidth * 2;
    this.startY = env.fieldMinY + env.tileHeight * 5;
    this.currX = this.startX;
    this.currY = this.startY;
    this.resetDelay = 1000;
  }

  update(newX = this.currX, newY = this.currY) {
    if (!env.isGameActive) {
      return;
    }
    (this.currX = newX), (this.currY = newY);
    // console.log(`x: ${this.currX}, y:${this.currY}`);
  }

  reset() {
    this.update(this.startX, this.startY);
  }

  render() {
    // eslint-disable-next-line no-undef
    ctx.drawImage(Resources.get(this.sprite), this.currX, this.currY);
  }

  handleInput(code) {
    if (!env.isGameActive) {
      return;
    }
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
    if (this.currY === env.fieldMinY) {
      env.isGameActive = false;
      env.incrementScore();
      env.updateGameInfo(env.winMessage);
      setTimeout(() => {
        env.isGameActive = true;
        player.reset();
        env.updateGameInfo(env.welcomeMessage);
      }, this.resetDelay);
    }
    console.log(`x: ${this.currX}, y:${this.currY}`);
  }
}

const player = new Player();

class Enemy {
  constructor(startY, player) {
    this.direction = getRandomDirection();
    this.sprite = `images/enemy-bug-${this.direction}.png`;
    this.minX = -env.tileWidth;
    this.maxX = env.fieldMaxX + env.tileWidth;
    this.startX = this.direction === 'right' ? this.minX : this.maxX;
    this.startY = startY;
    this.currX = this.startX;
    this.currY = this.startY;
    this.minSpeed = 150;
    this.maxSpeed = 250;
    this.mult =
      this.direction === 'right'
        ? getRandomNumber(this.minSpeed, this.maxSpeed)
        : -getRandomNumber(this.minSpeed, this.maxSpeed);
    this.player = player;
  }
  checkCollision() {
    if (
      this.player.currX >= this.currX &&
      this.player.currX <= this.currX + env.tileWidth &&
      this.player.currY >= this.currY &&
      this.player.currY <= this.currY + env.tileHeight
    ) {
      return true;
    }
    // console.log('no collision');
    return false;
  }
  update(dt) {
    console.log(`x: ${this.currX}, y:${this.currY}`);
    if (this.checkCollision()) {
      console.log('collision');
      env.resetScore();
      env.updateGameInfo(env.loseMessage);
      setTimeout(() => {
        this.player.updateGameInfo(player.startX, player.startY);
        env.updateGameInfo(env.welcomeMessage);
      }, 1000);
      this.player.update(player.startX, player.startY);
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
    // eslint-disable-next-line no-undef
    ctx.drawImage(Resources.get(this.sprite), this.currX, this.currY);
  }
}

const allEnemies = [
  new Enemy(env.tileHeight, player),
  new Enemy(env.tileHeight * 2, player),
  new Enemy(env.tileHeight * 3, player),
];

document.addEventListener('keyup', function (e) {
  const allowedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  if (allowedKeys.includes(e.code)) player.handleInput(e.code);
});

const isItFriday13thToday = () => new Date().getDay() === 5 && new Date().getDate() === 13;

document.addEventListener('DOMContentLoaded', () => {
  if (isItFriday13thToday()) {
    env.highScore = 0;
    env.saveHighScore(env.highScore);
    env.updateGameInfo(`It's Friday 13th! Your High Score is now gone!`);
  } else {
    console.log(isItFriday13thToday());
    env.updateGameInfo(env.welcomeMessage);
    console.log(player);
    console.log(env);
    allEnemies.forEach(enemy => console.log(enemy));
  }
});
