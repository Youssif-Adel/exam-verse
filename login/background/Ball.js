const canvas = document.getElementById("floatingBalls");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

export default class Ball {
  constructor(radius = 0, balls) {
    this.radius = radius;
    this.balls = balls;

    this.color = `rgb(255,255,255)`;

    this.x =
      Math.floor(Math.random() * (canvas.width - this.radius * 2)) +
      this.radius;
    this.y =
      Math.floor(Math.random() * (canvas.height - this.radius * 2)) +
      this.radius;

    this.speed = 2;

    this.direction = [
      (Math.random() - 0.5) * this.speed,
      (Math.random() - 0.5) * this.speed,
    ];
  }

  update() {
    this.move();
    this.draw();
    this.drawLine();
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }

  move() {
    if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
      this.direction[0] = -this.direction[0];
    } else if (
      this.y + this.radius > canvas.height ||
      this.y - this.radius < 0
    ) {
      this.direction[1] = -this.direction[1];
    }

    this.x += this.direction[0];
    this.y += this.direction[1];
  }

  drawLine() {
    this.balls.forEach((ball) => {
      let x = ball.x;
      let y = ball.y;
      let length = Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));

      if (length > 0 && length <= 200) {
        ctx.beginPath();
        ctx.strokeStyle = `rgb(255,255,255, 0.2)`;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.closePath();
      }
    });
  }
}
