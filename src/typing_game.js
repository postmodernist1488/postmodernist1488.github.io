const healthbar = document.getElementById("healthbar");
const text_input = document.getElementById("typing-game-input");
const canvas = document.querySelector("canvas");
canvas.style.marginRight = "auto";
canvas.style.marginLeft = "auto";
const difficultySlider = document.getElementById("difficulty-slider");
const difficultyLabel = document.getElementById("difficulty-label");
const ctx = canvas.getContext("2d");
var words;
var circles;
var particles;
var score = 0.0;
var highscore = 0.0;
ctx.fillStyle = "red";

//TODO: score

window.addEventListener('load', onPageLoad);

function random_word() {
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
}

async function onPageLoad() {
    const response = await fetch('/assets/words.json')
    if (!response.ok) {
        throw new Error("File could not be fetched!!");
    }
    words = await response.json();
    start_game();
}
class Particle {
    constructor(x, y, size, dx, dy, color, ttl) {
        this.x = x, 
        this.y = y, 
        this.size = size, 
        this.dx = dx, 
        this.dy= dy, 
        this.color = color
        this.timeOfDeath = performance.now() + ttl
    }

    update(dt) {
        this.x += this.dx * dt;
        this.y += this.dy * dt;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fill();
    }
}

class Circle {
    constructor(x, y, radius, velocity, word, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.velocity = velocity;
        this.word = word;
        this.color = color;
    }
    move_to(x, y, dt) {
        const dir = Math.atan2(y - this.y, x - this.x);
        this.x += Math.cos(dir) * this.velocity * dt;
        this.y += Math.sin(dir) * this.velocity * dt;
    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = "black"
        ctx.textAlign = "center"
        ctx.font = "20px sans-serif";
        ctx.fillText(this.word, this.x, this.y);
    }
    collides_with(other, threshold) {
        const a = this.x - other.x;
        const b = this.y - other.y;

        return Math.sqrt(a * a + b * b) + threshold < this.radius + other.radius;
    }
}

var player = new Circle(canvas.width / 2, canvas.height * 0.9, 50, 0, "you", "green");

function valid(ch) {
    return ch >= 'a' && ch <= 'z' || ch >= 'A' && ch <= 'Z' || ch == '-';
}

var time_til_next_circle = 1.0;
var spawn_factor = 1.0

function spawn_circle() {
    circles.push(new Circle(
        Math.random() * canvas.width, 
        canvas.height * 0.2, 
        Math.random() * 50 + 10, 
        50, 
        random_word(), 
        "red")
    );
}

function destroy_animation(destroyed) {
    //decomposing the destroyed circle
    let material = destroyed.radius;
    while (material > 0) {
        let size = (Math.random() + 1) * destroyed.radius / 10;
        let dx = (Math.random() * 2 - 1) * destroyed.velocity;
        let dy = (Math.random() * 2 - 1) * destroyed.velocity;
        particles.push(
            new Particle(
                destroyed.x,
                destroyed.y,
                size,
                dx,
                dy,
                color = destroyed.color,
                Math.random() * 3000 + 2000
            )
        )
        material -= size;
    }
}

const Difficulty = {
    Easy: 0.001,
    Medium: 0.003,
    Hard: 0.005,
    Ultrahard: 0.01,
}

var currentDifficulty;

function update(dt) {
    time_til_next_circle -= dt;
    if (time_til_next_circle <= 0) {
        time_til_next_circle = spawn_factor * (Math.random() * 4.0 + 1.0);
        spawn_circle();
    }
    let i = 0;
    while (i < circles.length) {
        if (circles[i].word == text_input.value.toLowerCase()) {
            const destroyed = circles.splice(i, 1)[0];
            destroy_animation(destroyed)
            console.log(particles)
            text_input.value = '';
            score += destroyed.word.length;
            spawn_factor *= (1 - currentDifficulty * destroyed.word.length);
            if (circles.length == 0) {
                time_til_next_circle /= 3;
            } else if (circles.length == 1) {
                time_til_next_circle /= 2;
            }
        } else {
            i++;
        }
    }
    for (let i = 0; i < circles.length; i++) {
        if (player.collides_with(circles[i], 10)) {
            const damage_per_sec = 5;
            healthbar.value -= dt * damage_per_sec;
            if (healthbar.value <= 0) gameActive = false;
        } else {
            circles[i].move_to(canvas.width / 2, canvas.height * 0.9, dt);
        }
    }
    i = 0;
    while (i < particles.length) {
        if (particles[i].timeOfDeath <= performance.now()) particles.splice(i, 1);
        else i++;
    }
    for (let i = 0; i < particles.length; i++) {
        particles[i].update(dt)
    }
}

function draw() {
    // clear the screen
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    player.draw(ctx)

    for (circle of circles) {
        circle.draw(ctx)
    }
    for (particle of particles) {
        particle.draw(ctx)
    }

    ctx.textAlign = "left"
    ctx.fillStyle = "black"
    ctx.font = "20px sans-serif";
    ctx.fillText(`Score: ${score}`, 0, 20);
    ctx.fillText(`Highcore: ${highscore}`, 0, 40);

}

var lastRender = 0
function game_over() {
    ctx.textAlign = "center"
    ctx.font = "40px Comic Sans";
    ctx.fillText("Game over!", canvas.width / 2, canvas.height / 2 - 80);
    ctx.fillText(`Your score is: ${score}`, canvas.width / 2, canvas.height / 2 - 40);
    if (score > highscore) {
        ctx.fillText("New highscore!", canvas.width / 2, canvas.height / 2);
        highscore = score;
    }
}

var gameActive = true;
function loop(timestamp) {
    var dt = (timestamp - lastRender) / 1000;

    update(dt);
    draw();

    lastRender = timestamp;
    if (gameActive) {
        window.requestAnimationFrame(loop);
    } else {
        game_over()
    }
}

function start_game() {
    score = 0;
    circles = [];
    particles = [];
    gameActive = true;
    healthbar.value = 100;
    time_til_next_circle = 1.0;
    spawn_factor = 1;
    text_input.focus();
    lastRender = window.performance.now();
    switch (difficultySlider.value) {
        case "1":
            currentDifficulty = Difficulty.Easy;
            difficultyLabel.innerHTML = 'Difficulty (Easy):'
            console.log(difficultyLabel)
            break;
        case "2":
            currentDifficulty = Difficulty.Medium;
            difficultyLabel.innerHTML = 'Difficulty (Medium):'
            break;
        case "3":
            currentDifficulty = Difficulty.Hard;
            difficultyLabel.innerHTML = 'Difficulty (Hard):'
            break;
        case "4":
            currentDifficulty = Difficulty.Ultrahard;
            difficultyLabel.innerHTML = 'Difficulty (Ultrahard):'
            break;
    }
    window.requestAnimationFrame(loop);
}

