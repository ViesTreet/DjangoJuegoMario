import cv2

class Jugador:
    def __init__(self, personaje):
        self.x = personaje.x
        self.y = personaje.y
        self.W = 1000
        self.H = 500
        self.speed = 5
        self.image = None
    
    def cambiar_imagen(self, personaje):
        logo = cv2.imread(personaje.imagen.path)
        if logo is None:
            raise FileNotFoundError("No se encontró imagen.")
        logo = cv2.resize(logo, (50, 50))
        self.image = logo
        self.lh, self.lw = logo.shape[:2]
        
    def actualizar_posicion(self, key, paredes):
        vx, vy = 0, 0
        if key == 'w':
            vy = -self.speed
        elif key == 's':
            vy = self.speed
        elif key == 'a':
            vx = -self.speed
        elif key == 'd':
            vx = self.speed
        
        colision = self.colision(paredes, key)
        if colision:
            pass
        else:  
            if key in ['w', 's']:
                self.y += vy
            elif key in ['a', 'd']:
                self.x += vx
                
            self.x = max(0, min(self.W - self.lw, self.x))
            self.y = max(0, min(self.H - self.lh, self.y))

        return self.x, self.y
    
    def colision(self, paredes, key):        
        for p in paredes:
            if self.x + 50 >= p.x and self.x <= p.x + 5:
                print("Colision")
                return True
            # elif  and key == 'a':
            #     print("Colision")
            #     return True
        
        return False
            
                
    
    