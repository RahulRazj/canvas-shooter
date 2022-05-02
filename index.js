const canvas = document.querySelector('canvas');

const c = canvas.getContext('2d');

const scoreEl = document.querySelector('#scoreElement');

const startBtn = document.querySelector('#startBtn');

const scoreBoard = document.querySelector('#scoreBoard');

const finalScore = document.querySelector('#finalScore');

canvas.width = innerWidth;
canvas.height = innerHeight;

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }
}

class Projectile extends Player {
  constructor(x, y, radius, color, velocity, speed = 1.5) {
    super(x, y, radius, color);
    this.velocity = velocity;
    this.speed = speed;
  }

  update() {
    this.draw();
    this.x += this.velocity.x * this.speed;
    this.y += this.velocity.y * this.speed;
  }
}

class Enemy extends Projectile {
  constructor(x, y, radius, color, velocity) {
    super(x, y, radius, color, velocity);
  }
}

const friction = 0.98;
class Particle extends Enemy {
  constructor(x, y, radius, color, velocity) {
    super(x, y, radius, color, velocity);
    this.alpha = 1;
  }

  draw() {
    c.save();
    c.globalAlpha = this.alpha;
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x += this.velocity.x * this.speed;
    this.y += this.velocity.y * this.speed;
    this.alpha -= 0.01;
  }


}


let animationId;
const animate = () => {
  animationId = requestAnimationFrame(animate);

  c.fillStyle = 'rgba(0, 0, 0, 0.1)';
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();
  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      particle.update();
    }
  });
  projectiles.forEach((projectile, projectileInd) => {
    projectile.update();

    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(projectileInd, 1);
      }, 0);
    }
  });

  enemies.forEach((enemy, enemyInd) => {
    enemy.update();

    const playerDist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (playerDist - player.radius - enemy.radius < 1) {
      cancelAnimationFrame(animationId);
      finalScore.innerHTML = score;
      scoreBoard.style.display = 'flex'

    }

    projectiles.forEach((projectile, projectileInd) => {
      const projDist = Math.hypot(
        projectile.x - enemy.x,
        projectile.y - enemy.y
      );
      if (projDist - projectile.radius - enemy.radius < 1) {
        for (let i = 0; i < enemy.radius; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * (3 - 1) + 1,
              enemy.color, {
                x: (Math.random() - 0.5) * (Math.random() * 5),
                y: (Math.random() - 0.5) * (Math.random() * 5)
              })
          );
        }

        if (enemy.radius - 10 > 10) {
          score += 50;
          console.log(score);
          scoreEl.innerHTML = score
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });
          setTimeout(() => {
            projectiles.splice(projectile, 1);
          }, 0);
        } else {
          score += 100;
          console.log(score);
          scoreEl.innerHTML = score
          setTimeout(() => {
            projectiles.splice(projectileInd, 1);
            enemies.splice(enemyInd, 1);
          }, 0);
        }
      }
    });
  });
};

const spawnEnemies = () => {
  setInterval(() => {
    const radius = Math.random() * (30 - 10) + 10;

    let x;
    let y;

    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }

    const h = Math.random() * 360;
    const color = `hsl(${h}, 50%, 50%)`;
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
    const enemy = new Enemy(x, y, radius, color, {
      x: Math.cos(angle),
      y: Math.sin(angle),
    });
    enemies.push(enemy);
  }, 750);
};

const xPos = canvas.width / 2;
const yPos = canvas.height / 2;

let player = new Player(xPos, yPos, 15, 'white')
let projectiles = []
let enemies = []
let particles = []
let score = 0;

const resetGame = () => {
  player = new Player(xPos, yPos, 15, 'white')
  projectiles = []
  enemies = []
  particles = []
  score = 0
  scoreEl.innerHTML = score
  finalScore.innerHTML = score
}

addEventListener('click', (event) => {
  const angle = Math.atan2(
    event.clientY - canvas.height / 2,
    event.clientX - canvas.width / 2
  );

  const projectile = new Projectile(
    canvas.width / 2,
    canvas.height / 2,
    5,
    'white', {
      x: Math.cos(angle),
      y: Math.sin(angle),
    },
    6
  );

  projectiles.push(projectile);
});


startBtn.addEventListener('click', () => {
  resetGame();
  animate();
  spawnEnemies();
  scoreBoard.style.display = 'none';
})
