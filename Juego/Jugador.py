import cv2
import numpy as np

class Jugador:
    def __init__(self, W, H):
        self.x = 50
        self.y = 50
        self.W = W
        self.H = H
        self.speed = 5
        self.image = None
    
    def cambiar_imagen(self, img_path):
        logo = cv2.imread(img_path,cv2.IMREAD_UNCHANGED)
        if logo is None:
            raise FileNotFoundError("No se encontró aruco_0.png")
        if logo.shape[2] == 4:
            # Separar canales
            b, g, r, a = cv2.split(logo)
            # Crear fondo blanco
            fondo_blanco = np.ones_like(a, dtype=np.uint8) * 255
            # Combinar canales: donde alfa=0, usar blanco
            b = np.where(a == 0, fondo_blanco, b)
            g = np.where(a == 0, fondo_blanco, g)
            r = np.where(a == 0, fondo_blanco, r)
            # Reunir en una imagen RGB
            logo = cv2.merge([b, g, r])

        # Redimensionar
        logo = cv2.resize(logo, (50, 50))
        self.image = logo
        self.lh, self.lw = logo.shape[:2]
    
    def aumentar_Velocidad(self, velocidad):
        self.speed = velocidad
        
    def actualizar_posicion(self, key):
        vx, vy = 0, 0
        if key == ord('w'):
            vy = -self.speed
        elif key == ord('s'):
            vy = self.speed
        elif key == ord('a'):
            vx = -self.speed
        elif key == ord('d'):
            vx = self.speed
            
        if key != 255:
            if key in [ord('w'), ord('s')]:
                self.y += vy
            elif key in [ord('a'), ord('d')]:
                self.x += vx
                
        self.x = max(0, min(self.W - self.lw, self.x))
        self.y = max(0, min(self.H - self.lh, self.y))
        print(self.x, self.y)
        return self.x, self.y