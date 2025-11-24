import cv2
import numpy as np
import time

from Jugador import Jugador

H, W = 500, 1000
jugador = Jugador(W, H)
jugador.cambiar_imagen("aruco_0.png")

# Tamaño del lienzo
lh, lw = jugador.image.shape[:2]

# Posición inicial y velocidad
x, y = jugador.x, jugador.y
vx, vy = 0, 0
key = 255
while True:
    # Lienzo blanco
    img = np.full((H, W, 3), 255, dtype=np.uint8)
    
    # Pega el logo
    img[y:y+lh, x:x+lw] = jugador.image

    cv2.imshow("Blanco", img)
    # 16 ms ~ 60 FPS. No bloquea el loop.
    key = cv2.waitKey(16) & 0xFF
    
    x,y = jugador.actualizar_posicion(key)

    if key in (ord('q'), 27):  # 'q' o ESC para salir
        break

cv2.destroyAllWindows()
cv2.imwrite("blanco.png", img)
