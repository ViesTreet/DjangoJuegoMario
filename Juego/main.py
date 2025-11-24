import cv2
import numpy as np
import time
from Jugador import Jugador
from Pared import Pared
from random import randint

H, W = 500, 1000
jugador = Jugador(W, H)
jugador.cambiar_imagen("mario.png")

lh, lw = jugador.image.shape[:2]
grosor = 5

modo_destruccion = False
duracion_modo_destruccion = randint(3,7)
inicio_destruccion = None
hongo_vivo = True  

lista_paredes = [
    (0, 0, W, grosor), (0, H - grosor, W, H),
    (0, 0, grosor, H), (W - grosor, 0, W, H),
    (200, 100, 800, 100 + grosor),
    (300, 400, 800, 400 + grosor),
    (100, 0, 100 + grosor, 400),
    (200, 100, 200 + grosor, 500),
    (800, 100, 800 + grosor, 300),
    (300, 100, 300 + grosor, 300),
    (900, 0, 900 + grosor, 100),
    (900, 200, 900 + grosor, 400),
    (800, 200, 900, 200 + grosor),
    (800, 400, 900, 400 + grosor),
    (300, 250, 600, 250 + grosor),
    (600, 300, 700, 300 + grosor),
    (600, 200, 600 + grosor, 300),
    (700, 200, 700 + grosor, 300)
]

pared = Pared(lista_paredes, grosor)

def cargarHongo(img_path):
    logo = cv2.imread(img_path, cv2.IMREAD_UNCHANGED)
    if logo is None:
        raise FileNotFoundError(f"No se encontró {img_path}")
    
    if logo.shape[2] == 4:
        b, g, r, a = cv2.split(logo)
        fondo_blanco = np.ones_like(a, dtype=np.uint8) * 255
        b = np.where(a == 0, fondo_blanco, b)
        g = np.where(a == 0, fondo_blanco, g)
        r = np.where(a == 0, fondo_blanco, r)
        logo = cv2.merge([b, g, r])
    
    return cv2.resize(logo, (50, 50))

def consumir(r1, r2):
    return not (r1[2] < r2[0] or r1[0] > r2[2] or r1[3] < r2[1] or r1[1] > r2[3])

hongo_img = cargarHongo("Mushroom.png")
hongo_pos = (350, 150, 400, 200)

key = 255
while True:
    img = np.full((H, W, 3), 255, dtype=np.uint8)

    pared.dibujar(img)

    if hongo_vivo:
        x1, y1, x2, y2 = hongo_pos
        img[y1:y2, x1:x2] = hongo_img

    img[jugador.y:jugador.y+lh, jugador.x:jugador.x+lw] = jugador.image

    cv2.imshow("Blanco", img)
    key = cv2.waitKey(16) & 0xFF

    old_x, old_y = jugador.x, jugador.y
    x, y = jugador.actualizar_posicion(key)
    jugador_rect = (x, y, x + lw, y + lh)

    if pared.colisiona(jugador_rect) and not modo_destruccion:
        jugador.x, jugador.y = old_x, old_y

    if hongo_vivo and consumir(jugador_rect, hongo_pos):
        jugador.cambiar_imagen("mariohigh.png")
        jugador.aumentar_Velocidad(10)
        hongo_vivo = False
        modo_destruccion = True
        inicio_destruccion = time.time()  

    if modo_destruccion:
        indice = pared.destruccion(jugador_rect)
        if indice is not None and indice > 3:  
            pared.eliminar(indice)

        if time.time() - inicio_destruccion >= duracion_modo_destruccion:
            modo_destruccion = False
            jugador.cambiar_imagen("mario.png")
            jugador.aumentar_Velocidad(5)  

    if key in (ord('q'), 27):
        break

cv2.destroyAllWindows()
