//config iniciales
const W = 1200;
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
const enemy = new Image();
enemy.src = "/static/game/img/enemy.png";
const vidasLogo = new Image();
vidasLogo.src = "/static/game/img/vida.png";
let spawnX = 50;
let spawnY = 300;
let mapaN=1;
let jugador = {
    x: spawnX,
    y: spawnY,
    w: 30,
    h: 30,
    speed: 4,
    img: personaje,
    velY: 0,        
    salto: false,   
    fuerzaSalto: -12, 
    gravedad: 0.8,  
    enSuelo: false,
    vidas: 3  
};
let enemigos = [];

let tiempoTermino = false;
//alert("Ingresa por la puerta cafe para cambiar de seccion.")
//alert("Consume el hongo para matar enemigos.")
//mapas
const mapa1 = [[
    //paredes externas y puerta
        [0, H - grosor, W, H], 
        [0, 0, grosor, H], 
        [W - grosor, 0, W, H-100],
        [W - grosor, H-100, W, H],


        [0,450,200,500],
        [200,400,400,500],
        [500,400,600,500],
        [600,350,650,500],
        [650,300,700,500],
        [700,250,750,500],
        [700,250,750,500],
        [750,200,800,500],
        [800,200,1100,210],
        [900,300,1200,400],
        [800,495,1200,500]
    ]
    ,
    [
        [400,450,500,500]
    ]
];

const mapa2 = [[
    //paredes externas y puerta
    [0, H - grosor, W, H], 
    [0, 0, grosor, H], 
    [W - grosor, 0, W, H-100],
    [W - grosor, H-100, W, H],

    // plataformas tipo parkour (bloques gruesos y delgados)
    [0, 420, 180, 500],
    [220, 360, 320, 380],
    [360, 300, 440, 320],
    [480, 240, 560, 260],
    [620, 200, 700, 220],
    [760, 260, 830, 500],
    [990, 320, 1200, 340],
    [830, 420, 1100, 430],
    [830,495,1200,500]

],
// lava: hoyos con lava (coordenadas pensadas para que el pj caiga si se equivoca)
[
    [180,450,760,500]
]];

const mapa3 = [[
    //paredes externas y puerta
    [0, H - grosor, W, H], 
    [0, 0, grosor, H], 
    [W - grosor, 0, W, H-100],
    [W - grosor, H-100, W, H],

    // laberinto horizontal con pasillos y plataformas estrechas
    [0, 420, 140, 500],
    [140, 360, 260, 380],
    [260, 300, 380, 320],
    [380, 240, 500, 260],
    [500, 180, 620, 200],
    [620, 240, 740, 260],
    [740, 300, 860, 320],
    [860, 360, 980, 500],
    [980, 495, 1200, 500]
],
[
    // lava en huecos del laberinto (trampas)
    [140, 450, 860, 500]
]];

const mapa4 = [[
    //paredes externas y puerta
    [0, H - grosor, W, H], 
    [0, 0, grosor, H], 
    [W - grosor, 0, W, H-100],
    [W - grosor, H-100, W, H],
    // zigzag vertical / escalera de plataformas (parkour de precisión)
    [0, 440, 120, 500],
    [160, 400, 260, 420],
    [300, 360, 380, 380],
    [420, 320, 500, 340],
    [540, 280, 620, 300],
    [660, 240, 740, 500],
    [800, 200, 860, 300],
    [950, 160, 1200, 400],
    [740, 495, 1200, 500]
],
[
    // lava en los huecos entre escalones
    [120,460,660,500]
]];

const mapa5 = [[
    //paredes externas y puerta
    [0, H - grosor, W, H], 
    [0, 0, grosor, H], 
    [W - grosor, 0, W, H-100],
    [W - grosor, H-100, W, H],

    // mezcla: plataformas anchas, huecos grandes, y un mini-laberinto final
    [0, 440, 200, 500],
    [240, 380, 420, 400],
    [460, 320, 620, 500],
    [660, 380, 820, 400],
    [860, 300, 980, 500],
    [860, 300, 1120, 320],
    [980,495,1200,500],
    // pasillo final con plataformas estrechas
    [740, 220, 770, 240],
    [780, 160, 820, 180],
    [840, 120, 880, 140],
    [1020, 120, 1200, 140]
],
[
    // lava: grandes hoyos y un tramo continuo
    [200, 460, 460, 500],
    [620, 400, 860, 500]

]];




let hongo = { x1: 400, y1: 150, w: 50, h: 50, vivo: false };

//variables iniciales
let modoDestruccion = false;
let tiempoDestruir = Math.floor(Math.random() * 5) + 3;
let tiempoInicio = 0;

if (personajeNombre === "mario") {
    jugador.speed = 5;
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
    
    if (rect.x2 >= prect.x1 && rect.x1 < prect.x1) {
        return 'lateralDer'; 
    }
    if (rect.x1 <= prect.x2 && rect.x2 > prect.x2) {
        return 'lateralIzq'; 
    }
    
    return null;
}

function moverJugador(paredes,irrompible,lava) {
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
        let puerta= {x1: paredes[3][0], y1: paredes[3][1], x2: paredes[3][2], y2: paredes[3][3]};
        if (colision(rect, prect)) {
            const lado = detectarColisionLados(rect, prect);
            if (
                prect.x1 === puerta.x1 &&
                prect.y1 === puerta.y1 &&
                prect.x2 === puerta.x2 &&
                prect.y2 === puerta.y2
            ){
                mapaN++;
                cambiarMapa(mapaN);
                return;
            }else{
                if (lado === 'arriba') {

                    jugador.y = prect.y1 - jugador.h;
                    jugador.velY = 0;
                    jugador.enSuelo = true;
                    jugador.salto = false;
                } else if (lado === 'abajo') {

                    jugador.y = prect.y2;
                    jugador.velY = 0;
                } else if (lado === 'lateralDer') {

                    jugador.x = oldX-5;
                }else if(lado === 'lateralIzq'){
                    jugador.x = oldX+5;
                }
            }
        }
    }
    for (let l of lava){
        let prect = { x1: l[0], y1: l[1], x2: l[2], y2: l[3] };
        if (colision(rect, prect)) {
            const lado = detectarColisionLados(rect, prect);
            if (lado != null){
                if(!modoDestruccion){
                    jugador.vidas -=1;
                }
                reiniciarJugador();
            }
        }   
    }
    /*
    if (modoDestruccion) {
        for (let i = paredes.length - 1; i >= 0; i--) {
            let p = paredes[i];
            let prect = { x1: p[0], y1: p[1], x2: p[2], y2: p[3] };
            
            
            if (colision(rect, prect) && i > irrompible) {
                paredes.splice(i, 1);
                break; 
            }
        }
    }

    */
    if (jugador.velY > 20) jugador.velY = 20;

    
    if (jugador.x < 0) reiniciarJugador();
    if (jugador.x + jugador.w > W) jugador.x = W - jugador.w;

    
    if (jugador.y > H) {
        reiniciarJugador();
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
        jugador.speed +=2;
        modoDestruccion = true;
        tiempoInicio = Date.now();
        
        jugador.fuerzaSalto -=2;
        jugador.gravedad = 0.8;
        vidasLogo.src = "/static/game/img/vidagold.png";
    }
}


function actualizarModoDestruccion() {
    if (!modoDestruccion) return;

    let elapsed = (Date.now() - tiempoInicio) / 1000;
    if (elapsed >= tiempoDestruir) {
        modoDestruccion = false;
        jugador.img = personaje;
        jugador.speed =4;
        if (personajeNombre === "mario") {
            jugador.speed = 5;
        } else {
            tiempoDestruir += 2;
        }
        jugador.fuerzaSalto = -12;
        jugador.gravedad = 0.8;
        tiempoTermino = true;
        vidasLogo.src = "/static/game/img/vida.png";
    }
}


function draw(paredes) {
    ctx.clearRect(0, 0, W, H);
    
    for (let p of paredes[0]) {
        if(p==paredes[0][3]){
            ctx.fillStyle = "brown";
        }
        else if(p==paredes[0][0] || p==paredes[0][1] || p==paredes[0][2]){
            ctx.fillStyle = "rgba(0,0,0,0)";
        }
        else{
            ctx.fillStyle = "green";
        }
        ctx.fillRect(p[0], p[1], p[2] - p[0], p[3] - p[1]);
    }
    for (let d of paredes[1]) {
        ctx.fillStyle = "rgba(234, 1, 1, 0.9)";
        ctx.fillRect(d[0], d[1], d[2] - d[0], d[3] - d[1]);
    }

    
    if (hongo.vivo) {
        ctx.drawImage(hongoImg, hongo.x1, hongo.y1, hongo.w, hongo.h);
    }

    for (let i = 0; i < jugador.vidas; i++){
        ctx.drawImage(vidasLogo,(1100+(i*30)),20,20,20);
    } 
    
    ctx.drawImage(jugador.img, jugador.x, jugador.y, jugador.w, jugador.h);
}

function reiniciarMapa() {
    jugador.x = 50;
    jugador.y = 300;
    jugador.velY = 0;
    jugador.img = personaje;
    jugador.speed = 4;
    jugador.fuerzaSalto = -12;
    jugador.gravedad = 0.8;
    jugador.enSuelo = false;
    jugador.salto = false;
    jugador.vidas =3;


    modoDestruccion = false;
    tiempoDestruir = Math.floor(Math.random() * 5) + 3;
    tiempoInicio = 0;
    tiempoTermino = false;
    if (personajeNombre === "mario") {
        jugador.speed = 5;
    } else {
        tiempoDestruir += 2;
    }
    mapaN=1;
    vidasLogo.src = "/static/game/img/vida.png";
    cambiarMapa(mapaN);
}


let paredesActuales = [...mapa1]; 
// funcion loop
function loop() {
    moverJugador(paredesActuales[0],3,paredesActuales[1]);
    verificarHongo();
    actualizarModoDestruccion();
    actualizarEnemigos(); 
    draw(paredesActuales);
    dibujarEnemigos(); 
    limpiarEnemigosMuertos();
    requestAnimationFrame(loop);
}

function actualizarEnemigos() {
    if (!enemigos || enemigos.length === 0) return;

    for (let en of enemigos) {
        if (!en.vivo) continue;

        // Mover según dirección
        en.x += en.speed * en.dir;

        // Si llegó al extremo derecho: cambiar dirección a izquierda
        if (en.x >= en.x0 + en.mov) {
            en.dir = -1;
        }

        // Si llegó al extremo izquierdo: cambiar dirección a derecha
        if (en.x <= en.x0) {
            en.dir = 1;
        }

        // --- Detectar colisión con jugador ---
        let jr = { x1: jugador.x, y1: jugador.y, x2: jugador.x + jugador.w, y2: jugador.y + jugador.h };
        let er = { x1: en.x, y1: en.y, x2: en.x + en.w, y2: en.y + en.h };

        if (colision(jr, er) && en.vivo ) {

            const stompMargin = 6;
            const jugadorBottom = jugador.y + jugador.h;

            if (modoDestruccion) {
                en.vivo = false;
                jugador.velY = jugador.fuerzaSalto / 2;
                jugador.enSuelo = false;
            } else {
                jugador.vidas -= 1;
                reiniciarJugador();
            }
        }
    }
}


function limpiarEnemigosMuertos() {
    enemigos = enemigos.filter(e => e.vivo);
}

// dibujar enemigos
function dibujarEnemigos() {
    if (!enemigos || enemigos.length === 0) return;
    for (let en of enemigos) {
        if (!en.vivo) continue;
        ctx.drawImage(en.img, en.x, en.y, en.w, en.h);
    }
}

// opcional: limpiar enemigos muertos (si no quieres que queden en la lista)
function limpiarEnemigosMuertos() {
    enemigos = enemigos.filter(e => e.vivo);
}


function reiniciarJugador() {
    if(jugador.vidas == 0){
        reiniciarMapa();
    }
    jugador.x = spawnX; // spawnX definido al cambiar de mapa
    jugador.y = spawnY; // spawnY definido al cambiar de mapa
    jugador.velY = 0;
    jugador.enSuelo = false;
    jugador.salto = false;
}

function cambiarMapa(numeroMapa) {
    switch(numeroMapa) {
        case 1:
            paredesActuales = [...mapa1];
            hongo = { x1: 1150, y1: 300-40, w: 50, h: 50, vivo: true };
            spawnX = 50; spawnY = 300;
            enemigos = [
                { x0: 900, x: 900, y: 300-30, w: 30, h: 30, img: enemy, mov: 200, vivo: true, speed: 1,dir: 1 }
            ];
            reiniciarJugador();
            break;
        case 2:
            paredesActuales = [...mapa2];
            hongo = { x1: 1100, y1: 280, w: 50, h: 50, vivo: true };
            spawnX = 20; spawnY = 350;
            enemigos = [
                { x0: 760, x: 760, y: 260-30, w: 30, h: 30, img: enemy, mov: 50, vivo: true, speed: 1,dir: 1 },
                { x0: 830, x: 830, y: 495-30, w: 30, h: 30, img: enemy, mov: 340, vivo: true, speed: 2,dir: 1 }
            ];
            reiniciarJugador();
            break;
        case 3:
            paredesActuales = [...mapa3];
            hongo = { x1: 520, y1: 140, w: 50, h: 50, vivo: true };
            spawnX = 30; spawnY = 350;
            enemigos = [
                { x0: 980, x: 980, y: 495-30, w: 30, h: 30, img: enemy, mov: 190, vivo: true, speed: 3,dir: 1 }
            ];
            reiniciarJugador();
            break;
        case 4:
            paredesActuales = [...mapa4];
            hongo = { x1: 1100, y1: 120, w: 50, h: 50, vivo: true };
            spawnX = 40; spawnY = 350;
            enemigos = [
                { x0: 740, x: 740, y: 495-30, w: 30, h: 30, img: enemy, mov: 400, vivo: true, speed: 3,dir: 1 },
                { x0: 950, x: 950, y: 160-30, w: 30, h: 30, img: enemy, mov: 100, vivo: true, speed: 2,dir: 1 }
            ];
            reiniciarJugador();
            break;
        case 5:
            paredesActuales = [...mapa5];
            hongo = { x1: 1150, y1: 80, w: 50, h: 50, vivo: true };
            spawnX = 10; spawnY = 400;
            enemigos = [
                { x0: 240, x: 240, y: 380-30, w: 30, h: 30, img: enemy, mov: 140, vivo: true, speed: 1,dir: 1 },
                { x0: 460, x: 460, y: 320-30, w: 30, h: 30, img: enemy, mov: 140, vivo: true, speed: 1.5,dir: 1 },
                { x0: 860, x: 860, y: 300-30, w: 30, h: 30, img: enemy, mov: 250, vivo: true, speed: 3,dir: 1 }
            ];
            reiniciarJugador();
            break;
        default:
            paredesActuales = [...mapa1];
            hongo = { x1: 1150, y1: 300-40, w: 50, h: 50, vivo: true };
            spawnX = 50; spawnY = 300;
            enemigos = [
                { x0: 900, x: 900, y: 300-30, w: 30, h: 30, img: enemy, mov: 200, vivo: true, speed: 1,dir: 1 }
            ];
            reiniciarJugador();
            break;
    }
    jugador.velY = 0;
    jugador.enSuelo = false;
    jugador.salto = false;
}
if (mapaN==1){
    cambiarMapa(mapaN)
}
loop();