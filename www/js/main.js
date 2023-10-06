let w_width;
let w_height;

if(window.innerWidth >= '487') {
    w_width = 360;
    w_height = 620;
} else {
    w_width = window.innerWidth;
    w_height = window.innerHeight;
}

const canvas = document.createElement('canvas');
canvas.width = w_width;
canvas.height = w_height;
canvas.style.background = '#000';
const ctx =  canvas.getContext('2d');

document.body.appendChild(canvas);

function clear() {
    ctx.clearRect(0, 0, w_width, w_height);
}

// Game State
const GameState = {
    state: 'pause',
    over: false,
    Point: 0,
    PointState: true,
    bounceGravity: -4,
}

// Controller
window.addEventListener('keydown', (event) => {
    if(event.code === 'Space') {
        Wing.play();
        if(GameState.state === 'start') {
            Bird.gravitySpeed = GameState.bounceGravity;
        }
         else if(GameState.state === 'over') {
            GameState.state = 'pause';
            Bird.y = w_height / 2 + 125;
         }
        else {
            GameState.Point = 0;
            GameState.PointState = true;
            GameState.state = 'start';
            Bird.gravitySpeed = GameState.bounceGravity;
        }
    }
})
window.addEventListener('touchstart', (event) => {
        Wing.play();
        if(GameState.state === 'start') {
            Bird.gravitySpeed = GameState.bounceGravity;
        }
         else if(GameState.state === 'over') {
            GameState.state = 'pause';
            Bird.y = w_height / 2 + 125;
         }
        else {
            GameState.Point = 0;
            GameState.PointState = true;
            GameState.state = 'start';
            Bird.gravitySpeed = GameState.bounceGravity;
        }
})

// Sound
function Sound(src) {
    this.sound = document.createElement('audio');
    this.sound.src = src;
    this.sound.setAttribute('preload', 'auto');
    this.sound.setAttribute('controls', 'none');
    this.sound.style.display = 'none';
    this.play = function() {
        this.sound.play();
    }
    this.stop = function() {
        this.sound.pause();
    }
}

// Score
let scoreImg = [];
for(let i = 0; i <= 9; i++) {
    let img = new Image();
    img.src = `./img/Numbers/${i}.png`;
    scoreImg.push(img);
}
function DrawScore() {
    this.scoreStr = GameState.Point.toString();
    this.x = 0;
    this.y = 20;
    for(let i = 0; i < this.scoreStr.length; i++) {
        this.x += 20;
        const scoreIdx = parseInt(this.scoreStr[i]);
        ctx.drawImage(scoreImg[scoreIdx], this.x, this.y, 20, 20);
    }
}


// Sprite
function Sprite(img, x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.img = new Image();
    this.img.src = img;
    this.speed = 1;
    this.angle = 0;
    this.gravity = 0.1;
    this.gravitySpeed = 0;
    this.bounce = 1;
    this.pipegap = 200;
}
Sprite.prototype.Draw = function(hide) {
    ctx.drawImage(this.img, this.x, this.y, this.w, this.h);

}
Sprite.prototype.Bullet = function() {
    this.x -= this.speed;
    if(this.x < this.w / -2) {
        this.x = 0;
    }
}
Sprite.prototype.Collision = function(withobj) {
    // Collision x
    for(let i = 0; i < withobj.length; i++) {
        if(this.x + this.w / 2 > withobj[i].x && this.x - this.w /2 < withobj[i].x + withobj[i].w) {
            // Collision y
            if(this.y + this.h / 2 > withobj[i].y + this.pipegap / 2 || this.y - this.h / 2 < withobj[i].y - this.pipegap / 2) {
                if(GameState.state === 'start') {
                    Pipe[0].x = w_width;
                    Pipe[1].x = w_width + 50 + w_width / 2;
                    Hit.play();
                    setTimeout(() => {
                        Die.play();
                    }, 700);
                    GameState.state = 'over'; 
                } 
            }
            if(GameState.PointState && this.x - this.w / 2 < withobj[i].x + withobj[i].w) {
                Point.play();
                GameState.Point += 1;
                GameState.PointState = false;
            }
        }
    }

}
Sprite.prototype.Gravity = function() {
    if(this.y >= 580 ) {
        this.gravitySpeed = -this.gravitySpeed * this.bounce;
        this.y += this.gravitySpeed;
    } else {
        this.gravitySpeed += this.gravity;
        this.y += this.gravitySpeed;
    }
}
Sprite.prototype.DrawPipe = function() {
    this.x -= this.speed;

    if(this.x < -50) {
        GameState.PointState = true;
        this.y = w_height / 2 - 100 + (Math.random() * 150);
        this.x = w_width + 50;
    }
    ctx.drawImage(this.img, this.x, this.y + this.pipegap / 2, this.w, this.h);
    
    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y - this.pipegap / 2);
    ctx.rotate(180 * Math.PI / 180);
    ctx.drawImage(this.img, this.w / -2, 0, this.w, this.h);
    ctx.restore();
}
Sprite.prototype.DrawBird = function() {
    this.img

    if(this.gravitySpeed > 1 && this.angle < 45) {
        this.angle += this.gravitySpeed;
    }
    else if(this.gravitySpeed < -1 && this.angle > -45) {
        this.angle += this.gravitySpeed;
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle * Math.PI / 180);
    ctx.drawImage(this.img, this.w / -2, this.h / -2, this.w, this.h);
    ctx.restore();
}



// Create
const Background = new Sprite('./img/background-day.png', 0, 0, w_width, w_height);
const Foreground = new Sprite('./img/message.png', 65, 100, w_width -150, w_height -200);
const Bird = new Sprite('./img/yellowbird-midflap.png', w_width / 2 - 10, w_height / 2 + 125, 40, 40);
const Ground = new Sprite('./img/base.png', 0, w_height / 1.2, w_width * 2, w_width / 3);
const Pipe = [new Sprite('./img/pipe-green.png', w_width, w_height / 2, 50, w_height / 2), new Sprite('./img/pipe-green.png', w_width + 50 + w_width / 2, w_height / 2, 50, w_height / 2)];
const GameOver = new Sprite('./img/gameover.png', 50, w_height / 2 - 100, w_width - 100, w_width / 2 - 100);

const Wing = new Sound('./sound/wing.ogg');
const Point = new Sound('./sound/point.ogg');
const Die = new Sound('./sound/die.ogg');
const Hit = new Sound('./sound/hit.ogg');

// Looping
function loop() {
    requestAnimationFrame(loop)
    clear();
    Background.Draw();
    Bird.DrawBird(0);
    Bird.Collision(Pipe);
    if(GameState.state === 'start') {
        Pipe[0].DrawPipe();
        Pipe[1].DrawPipe();
        Bird.Gravity();
    }
    else if(GameState.state === 'over') {
        GameOver.Draw();
    }
    else {
        Foreground.Draw();
    }
    Ground.Draw();
    Ground.Bullet();
    DrawScore();
}

loop()