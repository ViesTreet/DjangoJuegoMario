import cv2

class Pared:
    def __init__(self, paredes, grosor=5):
        self.paredes = paredes
        self.grosor = grosor

    def dibujar(self, img):
        """Dibuja todas las paredes sobre la imagen."""
        for p in self.paredes:
            cv2.rectangle(img, (p[0], p[1]), (p[2], p[3]), (0, 0, 0), -1)

    def colisiona(self, rect1):
        """Verifica si un rectángulo (jugador) colisiona con alguna pared."""
        for p in self.paredes:
            if not (rect1[2] < p[0] or rect1[0] > p[2] or rect1[3] < p[1] or rect1[1] > p[3]):
                return True
        return False

    def destruccion(self, rect1):
        """Devuelve el índice de la pared con la que se colisiona."""
        for index, p in enumerate(self.paredes):
            if not (rect1[2] < p[0] or rect1[0] > p[2] or rect1[3] < p[1] or rect1[1] > p[3]):
                return index
        return None

    def eliminar(self, index):
        """Elimina una pared según su índice."""
        if index is not None and 0 <= index < len(self.paredes):
            self.paredes.pop(index)
