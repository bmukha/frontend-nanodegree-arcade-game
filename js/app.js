class Environment {
  constructor() {
    this.characterWidth = 101;
    this.characterHeight = 83;
    this.fieldMinX = 0;
    this.fieldMinY = -10;
    this.fieldMaxX = 505;
    this.fieldMaxY = 405;
    this.isGameOn = true;
  }
  startGame() {
    this.isGameOn = true;
  }
  stopGame() {
    this.isGameOn = false;
  }
}

const env = new Environment();

class ScoreBoard {
  constructor(highScoreHolder, messageHolder, currentScoreHolder) {
    this.currentScore = 0;
    this.highScoreHolder = document.querySelector(highScoreHolder);
    this.messageHolder = document.querySelector(messageHolder);
    this.welcomeMessage = "Let's go!";
    this.winMessage = 'You win!';
    this.loseMessage = 'You lose!';
    this.highScore = localStorage.getItem('highScore') ?? 0;
    this.currentScoreHolder = document.querySelector(currentScoreHolder);
  }
  updateGameInfo(message) {
    this.currentScoreHolder.innerText = `Current score: ${this.currentScore}`;
    this.highScoreHolder.innerText = `High score: ${this.highScore}`;
    this.messageHolder.innerText = `${message}`;
  }
  incrementScore() {
    this.currentScore += 1;
    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore;
      this.saveHighScore(this.highScore);
    }
  }
  saveHighScore(score) {
    localStorage.setItem('highScore', score);
  }
  resetScore(resetHighScore = false) {
    if (resetHighScore) {
      this.highScore = 0;
      this.saveHighScore();
    }
    this.currentScore = 0;
  }
}

const scoreBoard = new ScoreBoard('.high', '.message', '.current');
console.log(scoreBoard);

const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min) + min);

const directions = ['left', 'right'];

const getRandomDirection = () => directions[Math.floor(Math.random() * directions.length)];

class Player {
  constructor(env, scoreBoard) {
    this.env = env;
    this.scoreBoard = scoreBoard;
    this.sprite = 'images/char-boy.png';
    this.startX = this.env.characterWidth * 2;
    this.startY = this.env.fieldMinY + this.env.characterHeight * 5;
    this.currX = this.startX;
    this.currY = this.startY;
    this.resetDelay = 1000;
  }

  update(newX = this.currX, newY = this.currY) {
    if (!this.env.isGameOn) {
      return;
    }
    (this.currX = newX), (this.currY = newY);
    // console.log(`x: ${this.currX}, y:${this.currY}`);
  }

  render() {
    // eslint-disable-next-line no-undef
    ctx.drawImage(Resources.get(this.sprite), this.currX, this.currY);
  }

  handleInput(code) {
    if (!this.env.isGameOn) {
      return;
    }
    switch (code) {
      case 'ArrowLeft':
        if (this.currX - this.env.characterWidth < this.env.fieldMinX) return;
        this.currX -= this.env.characterWidth;
        break;
      case 'ArrowRight':
        if (this.currX + this.env.characterWidth >= this.env.fieldMaxX) return;
        this.currX += this.env.characterWidth;
        break;
      case 'ArrowUp':
        if (this.currY - this.env.characterHeight < this.env.fieldMinY) return;
        this.currY -= this.env.characterHeight;
        break;
      case 'ArrowDown':
        if (this.currY + this.env.characterHeight >= this.env.fieldMaxY) return;
        this.currY += this.env.characterHeight;
        break;
      default:
        break;
    }
    console.log(`x: ${this.currX}, y:${this.currY}`);
    this.update(this.currX, this.currY);
    if (this.currY === this.env.fieldMinY) {
      this.env.isGameOn = false;
      this.scoreBoard.incrementScore();
      this.scoreBoard.updateGameInfo(this.scoreBoard.winMessage);
      setTimeout(() => {
        this.env.isGameOn = true;
        player.update(this.startX, this.startY);
        this.scoreBoard.updateGameInfo(this.scoreBoard.welcomeMessage);
      }, this.resetDelay);
    }
    // console.log(`x: ${this.currX}, y:${this.currY}`);
  }
}

const player = new Player(env, scoreBoard);

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
      this.player.currY <= this.currY + env.characterHeight
    ) {
      // console.log(`playerX: ${this.player.currX}`);
      // console.log(`playerY: ${this.player.currY}`);
      // console.log(`enemyX: ${this.currX}`);
      // console.log(`enemyY: ${this.currY}`);
      return true;
    }
    // console.log('no collision');
    return false;
  }
  update(dt) {
    if (this.checkCollision()) {
      // console.log('collision');
      env.resetScore();
      env.updateGameInfo(env.loseMessage);
      setTimeout(() => {
        this.player.update(this.player.startX, this.player.startY);
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
    // dt = parseInt(dt * 100);
    this.currX = this.currX + dt * this.mult;
    // console.log(`x: ${this.currX}, y:${this.currY} dt:${dt}`);
  }
  render() {
    // eslint-disable-next-line no-undef
    ctx.drawImage(Resources.get(this.sprite), this.currX, this.currY);
  }
}

const firstEnemyY = env.fieldMinY + env.characterHeight;
const secondEnemyY = env.fieldMinY + env.characterHeight * 2;
const thirdEnemyY = env.fieldMinY + env.characterHeight * 3;

const allEnemies = [new Enemy(firstEnemyY, player), new Enemy(secondEnemyY, player), new Enemy(thirdEnemyY, player)];

document.addEventListener('keyup', function (e) {
  const allowedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  if (allowedKeys.includes(e.code)) player.handleInput(e.code);
});

const isItFriday13thToday = () => new Date().getDay() === 5 && new Date().getDate() === 13;

document.addEventListener('DOMContentLoaded', () => {
  if (isItFriday13thToday()) {
    scoreBoard.highScore = 0;
    scoreBoard.saveHighScore(env.highScore);
    scoreBoard.updateGameInfo(`It's Friday 13th! Your High Score is now gone!`);
  } else {
    // console.log(isItFriday13thToday());
    scoreBoard.updateGameInfo(scoreBoard.welcomeMessage);
    console.log(player);
    console.log(env);
    allEnemies.forEach(enemy => console.log(enemy));
  }
});
