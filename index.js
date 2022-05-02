const canvas = document.querySelector("canvas");

const c = canvas.getContext("2d");


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
    this.x += (this.velocity.x * this.speed);
    this.y += (this.velocity.y * this.speed);
  }
}

class Enemy extends Projectile {
  constructor(x, y, radius, color, velocity) {
    super(x, y, radius, color, velocity);
  }
}


let animationId;
const animate = () => {

  animationId = requestAnimationFrame(animate);
  c.fillStyle = 'rgba(0, 0, 0, 0.1)';
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();
  projectiles.forEach((projectile, projectileInd) => {
    projectile.update();

    if (projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width || projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > canvas.height) {
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
    }

    projectiles.forEach((projectile, projectileInd) => {
      const projDist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
      if (projDist - projectile.radius - enemy.radius < 1) {

        if (enemy.radius - 10 > 10) {
          gsap.to(enemy, {
            radius: enemy.radius - 10
          })
          setTimeout(() => {
            projectiles.splice(projectile, 1);
          }, 0);
        } else {
          setTimeout(() => {
            projectiles.splice(projectileInd, 1);
            enemies.splice(enemyInd, 1);
          }, 0);
        }

      }
    })
  })
}

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
    const angle = Math.atan2(
      canvas.height / 2 - y,
      canvas.width / 2 - x
    )
    const enemy = new Enemy(
      x,
      y,
      radius,
      color, {
        x: Math.cos(angle),
        y: Math.sin(angle)
      }
    )
    enemies.push(enemy);
  }, 750);
}

const xPos = canvas.width / 2;
const yPos = canvas.height / 2;

const player = new Player(xPos, yPos, 15, 'white');

const projectiles = [];

const enemies = []

addEventListener('click', (event) => {

  const angle = Math.atan2(
    event.clientY - canvas.height / 2,
    event.clientX - canvas.width / 2
  )

  const projectile = new Projectile(
    canvas.width / 2,
    canvas.height / 2,
    5,
    'white', {
      x: Math.cos(angle),
      y: Math.sin(angle)
    },
    4
  )

  projectiles.push(projectile)

});

animate()
spawnEnemies()
