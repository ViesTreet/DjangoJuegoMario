// CONFIG
const W = 1000;
const H = 500;
const grosor = 5;

// CANVAS
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// IMÁGENES


const personaje = new Image();
personaje.src = `/static/game/img/${personajeNombre}.png`;
const personajeHigh = new Image();
personajeHigh.src = `/static/game/img/${personajeNombre}high.png`;
const hongoImg = new Image();
hongoImg.src = "/static/game/img/Mushroom.png";


// JUGADOR
let jugador = {
    x: 50,
    y: 50,
    w: 40,
    h: 40,
    speed: 3,
    img: personaje
};

let tiempoTermino=false;

// LISTA DE PAREDES
let paredes = [
    [0, 0, W, grosor], [0, H - grosor, W, H],
    [0, 0, grosor, H], [W - grosor, 0, W, H],
    [200, 100, 800, 105],
    [300, 400, 800, 405],
    [100, 0, 105, 400],
    [200, 100, 205, 500],
    [800, 100, 805, 300],
    [300, 100, 305, 300],
    [900, 0, 905, 100],
    [900, 200, 905, 400],
    [800, 200, 900, 205],
    [800, 400, 900, 405],
    [300, 250, 600, 255],
    [600, 300, 700, 305],
    [600, 200, 605, 300],
    [700, 200, 705, 300]
];

// HONGO
let hongo = { x1: 350, y1: 150, w: 50, h: 50, vivo: true };

// MODO DESTRUCCIÓN
let modoDestruccion = false;
let tiempoDestruir = Math.floor(Math.random() * 5) + 3; // 3–7 s
let tiempoInicio = 0;
if (personajeNombre === "mario") {
    jugador.speed = 5;
} else {
    tiempoDestruir += 2;
}
console.log(jugador.speed, tiempoDestruir);
// INPUT DEL TECLADO
let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// COLISION RECT–RECT
function colision(r1, r2) {
    return !(r1.x2 < r2.x1 || r1.x1 > r2.x2 || r1.y2 < r2.y1 || r1.y1 > r2.y2);
}

// ACTUALIZAR POSICIÓN
function moverJugador() {
    let oldX = jugador.x;
    let oldY = jugador.y;

    if (keys["ArrowUp"]) jugador.y -= jugador.speed;
    if (keys["ArrowDown"]) jugador.y += jugador.speed;
    if (keys["ArrowLeft"]) jugador.x -= jugador.speed;
    if (keys["ArrowRight"]) jugador.x += jugador.speed;

    let rect = {
        x1: jugador.x, y1: jugador.y,
        x2: jugador.x + jugador.w, y2: jugador.y + jugador.h
    };

    // Colisión con paredes
    if (!modoDestruccion) {
        for (let p of paredes) {
            let prect = { x1: p[0], y1: p[1], x2: p[2], y2: p[3] };
            if (colision(rect, prect)) {
                jugador.x = oldX;
                jugador.y = oldY;
                break;
            }
        }
    } else {
        // Destruir paredes
        for (let i = 0; i < paredes.length; i++) {
            let p = paredes[i];
            let prect = { x1: p[0], y1: p[1], x2: p[2], y2: p[3] };
            if (colision(rect, prect) && i > 3) {
                paredes.splice(i, 1);
                break;
            }
        }
    }
}

// CONSUMIR HONGO
function verificarHongo() {
    if (!hongo.vivo) return;

    let jr = { 
        x1: jugador.x,
        y1: jugador.y,
        x2: jugador.x + jugador.w,
        y2: jugador.y + jugador.h
    };

    let hr = { 
        x1: hongo.x1,
        y1: hongo.y1,
        x2: hongo.x1 + hongo.w,
        y2: hongo.y1 + hongo.h
    };

    if (colision(jr, hr)) {
        hongo.vivo = false;
        jugador.img = personajeHigh;
        jugador.speed = 10;
        modoDestruccion = true;
        tiempoInicio = Date.now();
    }
}

// TIMER del modo destrucción
function actualizarModoDestruccion() {
    if (!modoDestruccion) return;

    let elapsed = (Date.now() - tiempoInicio) / 1000;
    if (elapsed >= tiempoDestruir) {
        modoDestruccion = false;
        jugador.img = personaje;
        jugador.speed = 5;
        tiempoTermino=true;
    }
}

// DIBUJAR
function draw() {
    ctx.clearRect(0, 0, W, H);

    // Paredes
    ctx.fillStyle = "black";
    for (let p of paredes) {
        ctx.fillRect(p[0], p[1], p[2] - p[0], p[3] - p[1]);
    }

    // Hongo
    if (hongo.vivo) {
        ctx.drawImage(hongoImg, hongo.x1, hongo.y1, hongo.w, hongo.h);
    }

    // Jugador
    ctx.drawImage(jugador.img, jugador.x, jugador.y, jugador.w, jugador.h);
}


function reiniciarMapa() {
    // Reiniciar jugador
    jugador.x = 50;
    jugador.y = 50;
    jugador.img = personaje;
    jugador.speed = 5;

    // Reiniciar paredes
    paredes = [
        [0, 0, W, grosor], [0, H - grosor, W, H],
        [0, 0, grosor, H], [W - grosor, 0, W, H],
        [200, 100, 800, 105],
        [300, 400, 800, 405],
        [100, 0, 105, 400],
        [200, 100, 205, 500],
        [800, 100, 805, 300],
        [300, 100, 305, 300],
        [900, 0, 905, 100],
        [900, 200, 905, 400],
        [800, 200, 900, 205],
        [800, 400, 900, 405],
        [300, 250, 600, 255],
        [600, 300, 700, 305],
        [600, 200, 605, 300],
        [700, 200, 705, 300]
    ];

    // Reiniciar hongo
    hongo = { x1: 350, y1: 150, w: 50, h: 50, vivo: true };

    // Reiniciar flags
    modoDestruccion = false;
    tiempoDestruir = Math.floor(Math.random() * 5) + 3;
    tiempoInicio = 0;
    tiempoTermino = false;
}


// LOOP PRINCIPAL

function loop() {
    moverJugador();
    verificarHongo();
    actualizarModoDestruccion();

    if (tiempoTermino) {
        reiniciarMapa();
    }

    draw();
    requestAnimationFrame(loop);
}


loop();
