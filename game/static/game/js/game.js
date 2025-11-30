//config iniciales
const W = 1000;
const H = 500;
const grosor = 5;

//lienzo
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

//recursos
const personaje = new Image();
personaje.src = `/static/game/img/${personajeNombre}.png`;
const personajeHigh = new Image();
personajeHigh.src = `/static/game/img/${personajeNombre}high.png`;
const hongoImg = new Image();
hongoImg.src = "/static/game/img/Mushroom.png";

//objeto jugador
let jugador = {
    x: 50,
    y: 50,
    w: 40,
    h: 40,
    speed: 5,
    img: personaje,
    velY: 0,        
    salto: false,   
    fuerzaSalto: -15, 
    gravedad: 0.8,  
    enSuelo: false  
};

let tiempoTermino = false;

//mapas
const mapa1 = [
    
    [0, 0, W, grosor], 
    [0, H - grosor, W, H], 
    
    
    [0, 0, grosor, H], 
    [W - grosor, 0, W, H],
    
    
    [200, 400, 800, 405], 
    [100, 300, 300, 305], 
    [600, 300, 900, 305], 
    [400, 200, 600, 205], 
    [100, 150, 250, 155], 
    [700, 150, 850, 155]  
];

const mapa2 = [
    
    [0, 0, W, grosor], 
    [0, H - grosor, W, H],
    
    
    [0, 0, grosor, H], 
    [W - grosor, 0, W, H],
    
    
    [100, 400, 300, 405],
    [300, 350, 500, 355],
    [500, 300, 700, 305],
    [700, 250, 900, 255],
    
    
    [150, 200, 350, 205],
    [450, 150, 650, 155],
    [750, 100, 950, 105],
    
    
    [400, 400, 450, 300]
];

const mapa3 = [
    
    [0, 0, W, grosor], 
    [0, H - grosor, W, H],
    
    
    [0, 0, grosor, H], 
    [W - grosor, 0, W, H],
    
    
    [100, 400, 400, 405],
    [550, 400, 900, 405],
    
    
    [200, 300, 350, 305],
    [450, 300, 600, 305],
    [700, 300, 850, 305],
    
    
    [100, 200, 150, 400],
    [850, 200, 900, 400],
    
    
    [150, 150, 300, 155],
    [350, 100, 500, 105],
    [600, 150, 750, 155]
];


let hongo = { x1: 400, y1: 150, w: 50, h: 50, vivo: true };

//variables iniciales
let modoDestruccion = false;
let tiempoDestruir = Math.floor(Math.random() * 5) + 3;
let tiempoInicio = 0;

if (personajeNombre === "mario") {
    jugador.speed = 5;
    jugador.fuerzaSalto = -18; 
} else {
    tiempoDestruir += 2;
}


let keys = {};
document.addEventListener("keydown", function(e) {
    keys[e.key] = true;
    
    if ((e.key === " " || e.key === "ArrowUp") && jugador.enSuelo) {
        jugador.velY = jugador.fuerzaSalto;
        jugador.salto = true;
        jugador.enSuelo = false;
    }
});
document.addEventListener("keyup", function(e) {
    keys[e.key] = false;
});


function colision(r1, r2) {
    return !(r1.x2 < r2.x1 || r1.x1 > r2.x2 || r1.y2 < r2.y1 || r1.y1 > r2.y2);
}

//colisiones
function detectarColisionLados(rect, prect) {
    const margen = 2; 
    
    
    if (rect.y2 >= prect.y1 && rect.y1 < prect.y1 && 
        rect.x2 > prect.x1 + margen && rect.x1 < prect.x2 - margen) {
        return 'arriba';
    }
    
    if (rect.y1 <= prect.y2 && rect.y2 > prect.y2 &&
        rect.x2 > prect.x1 + margen && rect.x1 < prect.x2 - margen) {
        return 'abajo';
    }
    
    if ((rect.x2 >= prect.x1 && rect.x1 < prect.x1) ||
        (rect.x1 <= prect.x2 && rect.x2 > prect.x2)) {
        return 'lateral';
    }
    
    return null;
}



function moverJugador(paredes) {
    let oldX = jugador.x;
    let oldY = jugador.y;

    
    if (keys["ArrowLeft"]) jugador.x -= jugador.speed;
    if (keys["ArrowRight"]) jugador.x += jugador.speed;

    
    jugador.velY += jugador.gravedad;
    jugador.y += jugador.velY;

    
    jugador.enSuelo = false;

    let rect = {
        x1: jugador.x, y1: jugador.y,
        x2: jugador.x + jugador.w, y2: jugador.y + jugador.h
    };

    
    for (let p of paredes) {
        let prect = { x1: p[0], y1: p[1], x2: p[2], y2: p[3] };
        if (colision(rect, prect)) {
            const lado = detectarColisionLados(rect, prect);
            
            if (lado === 'arriba') {
                
                jugador.y = prect.y1 - jugador.h;
                jugador.velY = 0;
                jugador.enSuelo = true;
                jugador.salto = false;
            } else if (lado === 'abajo') {
                
                jugador.y = prect.y2;
                jugador.velY = 0;
            } else if (lado === 'lateral') {
                
                jugador.x = oldX;
            }
        }
    }

    
    if (modoDestruccion) {
        for (let i = paredes.length - 1; i >= 0; i--) {
            let p = paredes[i];
            let prect = { x1: p[0], y1: p[1], x2: p[2], y2: p[3] };
            
            
            if (colision(rect, prect) && i > 3) {
                paredes.splice(i, 1);
                break; 
            }
        }
    }

    
    if (jugador.velY > 20) jugador.velY = 20;

    
    if (jugador.x < 0) jugador.x = 0;
    if (jugador.x + jugador.w > W) jugador.x = W - jugador.w;

    
    if (jugador.y > H) {
        jugador.x = 50;
        jugador.y = 50;
        jugador.velY = 0;
    }
}


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
        jugador.speed = 8;
        modoDestruccion = true;
        tiempoInicio = Date.now();
        
        jugador.fuerzaSalto = -25;
        jugador.gravedad = 0.6;
    }
}


function actualizarModoDestruccion() {
    if (!modoDestruccion) return;

    let elapsed = (Date.now() - tiempoInicio) / 1000;
    if (elapsed >= tiempoDestruir) {
        modoDestruccion = false;
        jugador.img = personaje;
        jugador.speed = 5;
        jugador.fuerzaSalto = personajeNombre === "mario" ? -18 : -15;
        jugador.gravedad = 0.8;
        tiempoTermino = true;
    }
}


function draw(paredes) {
    ctx.clearRect(0, 0, W, H);

    
    ctx.fillStyle = "black";
    for (let p of paredes) {
        ctx.fillRect(p[0], p[1], p[2] - p[0], p[3] - p[1]);
    }

    
    if (hongo.vivo) {
        ctx.drawImage(hongoImg, hongo.x1, hongo.y1, hongo.w, hongo.h);
    }

    
    ctx.drawImage(jugador.img, jugador.x, jugador.y, jugador.w, jugador.h);
}

function reiniciarMapa() {
    
    jugador.x = 50;
    jugador.y = 50;
    jugador.velY = 0;
    jugador.img = personaje;
    jugador.speed = 5;
    jugador.fuerzaSalto = personajeNombre === "mario" ? -18 : -15;
    jugador.gravedad = 0.8;
    jugador.enSuelo = false;
    jugador.salto = false;

    
    paredes = [...mapa1];

    
    hongo = { x1: 400, y1: 150, w: 50, h: 50, vivo: true };

    
    modoDestruccion = false;
    tiempoDestruir = Math.floor(Math.random() * 5) + 3;
    tiempoInicio = 0;
    tiempoTermino = false;
}


let paredesActuales = [...mapa1]; 
// funcion loop
function loop() {
    moverJugador(paredesActuales);
    verificarHongo();
    actualizarModoDestruccion();

    if (tiempoTermino) {
        reiniciarMapa();
        paredesActuales = [...mapa1]; 
    }

    draw(paredesActuales);
    requestAnimationFrame(loop);
}


function cambiarMapa(numeroMapa) {
    switch(numeroMapa) {
        case 1:
            paredesActuales = [...mapa1];
            hongo = { x1: 400, y1: 150, w: 50, h: 50, vivo: true };
            break;
        case 2:
            paredesActuales = [...mapa2];
            hongo = { x1: 800, y1: 80, w: 50, h: 50, vivo: true };
            break;
        case 3:
            paredesActuales = [...mapa3];
            hongo = { x1: 450, y1: 80, w: 50, h: 50, vivo: true };
            break;
    }
    jugador.x = 50;
    jugador.y = 50;
    jugador.velY = 0;
}


cambiarMapa(3);
loop();