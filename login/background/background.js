import Ball from "./Ball.js";

const canvas = document.getElementById("floatingBalls");
const ctx = canvas.getContext("2d");

const numberOfBalls = 50;
let ballsArray = [];

function createBalls() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ballsArray = [];
  for (let i = 0; i < numberOfBalls; i++) {
    let ball = new Ball(2, ballsArray);
    ballsArray.push(ball);
  }
  animate();
}

function animate() {
  requestAnimationFrame(animate);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ballsArray.forEach((ball) => ball.update());
}

createBalls();

window.addEventListener(`resize`, () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ballsArray.forEach((ball) => ball.update());
});
