import Vector2D from './vector2d.js';
import Clock from './clock.js';
import conf from '../config.js';
import Sprite from './sprite.js';
import Fireball from './fireball.js';
import Hitbox from './hitbox.js';
import Enemy from './enemy.js';

class Player extends Hitbox {
    name;
    score;
    velocity;
    hp304;
    currentImageIndex;
    images;
    moving;
    update_timer;

    constructor(images_srcs, name, gigi, obstacle) {
        super(50, conf.GROUND_Y, 165, 175)
        this.obstacle = obstacle;
        this.score = 0;
        this.name = name;
        this.images = [];
        for (let src of images_srcs) {
            let img = new Image();
            img.src = src;
            this.images.push(img);
        }

        this.currentImageIndex = 0;
        this.velocity = new Vector2D();
        this.velocity.set(0, 0);
        this.hp304 = 165;
        this.score = 0;
        this.moving = false;
        this.update_timer = new Clock(125);
        this.canJump = true;
        this.bullets = [];
        this.enemies = [];
        this.enemies.push(new Enemy(this.enemies, conf.PLAYER_SRC, "Gigi"));

        setInterval(() => {
            this.enemies.push(new Enemy(this.enemies, conf.PLAYER_SRC, "Gigi"));
        }, 2500)
    }

    jump() {
        if (this.canJump) {
            this.velocity.y = 18;
        }
        if (this.position.y > conf.GROUND_Y) {
            this.canJump = false;
        }
    }

    shoot(ctx) {
        console.log("Shooting: " + ctx.canvas.clientHeight);
        console.log("y: " + this.position.y);
        let fireball = new Fireball(this.position.x + 75, this.position.y - 50);
        this.bullets.push(fireball);
    }

    draw(ctx) {
        ctx.drawImage(this.images[this.currentImageIndex], this.position.x,
            ctx.canvas.clientHeight - this.position.y, 175, 175);
        ctx.font = "30px Verdana";
        ctx.fillStyle = "white";
        ctx.fillText(this.name, this.position.x + 50, (ctx.canvas.clientHeight - (this.position.y + 30)));
        ctx.strokeStyle = "black";
        ctx.strokeRect(this.position.x + 20, (ctx.canvas.clientHeight - (this.position.y + 20)), 165, 20);
        ctx.fillStyle = "green";
        ctx.fillRect(this.position.x + 20, (ctx.canvas.clientHeight - (this.position.y + 20)), this.hp304, 20);
        this.bullets.forEach((b) => b.draw(ctx));
        this.enemies.forEach((e) => e.draw(ctx));
        this.drawScore(ctx)
        super.draw(ctx);

    }

    update() {
        //Collisione derubata da Crema :D
        const prevBottom = this.position.y;
        const prevLeft = this.position.x;
        const prevTop = this.position.y + this.height;
        const prevRight = this.position.x + this.width;

        this.checkCollisions();
        this.checkCollisionsWithEnemies();
        this.position.add(this.velocity);
        this.moving = this.velocity.x != 0;
        this.update_timer.update();
        this.velocity.y += -0.65;

        const bottom = this.position.y;
        const left = this.position.x;
        const top = this.position.y + this.height;
        const right = this.position.x + this.width;

        const collision = this.obstacle;
        console.log()

        if (bottom < collision.position.y + collision.height && right > collision.position.x && top > collision.position.y && left < collision.position.x + collision.width) {
            if (prevRight <= collision.position.x && right > collision.position.x) this.position.x = collision.position.x - this.width;
            if (prevLeft >= collision.position.x + collision.width && left < collision.position.x + collision.width) this.position.x = collision.position.x + collision.width;
            if (prevTop >= collision.position.y + collision.height && top < collision.position.y + collision.height) this.position.y = collision.position.y + collision.height;
            if (prevBottom >= collision.position.y + collision.height && bottom <= collision.position.y + collision.height) {
                this.position.y = collision.position.y + collision.height;
                this.velocity.y = 0;
                this.canJump = true;
            }
        }

        if (this.moving) {
            if (this.update_timer.tick()) {
                this.currentImageIndex += 1;
                this.currentImageIndex %= this.images.length;
            }

        }
        else {
            this.currentImageIndex = 0;
        }

        this.bullets.forEach((b) => b.update());
        this.enemies.forEach((e) => e.update());
    }

    get x() {
        return this.position.x;
    }
    get y() {
        return this.position.y;
    }

    checkCollisionsWithEnemies() {
        this.enemies.forEach((e) => {
            if (this.x < e.position.x + e.width && this.x + this.width > e.position.x && this.y < e.position.y + e.height) {
                alert("You're dead.\r\n\r\nGAME OVER\r\n\r\nScore: " + this.score + "\r\n\r\nPress OK to restart");
                this.reset();
            }
        });
    }
    reset() {
        this.enemies = [];
        this.bullets = [];
        this.score = 0;
        this.position.x = 50;
        this.position.y = conf.GROUND_Y;
        this.velocity.x = 0;
        this.velocity.y = 0;
    }

    drawScore(ctx) {
        ctx.fillStyle = "white";
        ctx.font = "30px Comic Sans MS";
        ctx.fillText("Score: " + this.score, 20, 30)
    }
    checkCollisions() {
        this.enemies.forEach((e) => {
            this.bullets.forEach((b) => {
                if (!e.deleted && b.collision(e)) {
                    console.log("colliding")
                    e.hp304 -= 20;
                    this.score += 5;
                    this.bullets.splice(this.bullets.indexOf(b), 1);
                }
            });
        });
    }
}

export default Player;