import cv2
import numpy as np
import time
import json
from random import randint

from .Jugador import Jugador
from .Pared import Pared
from ..models import Personaje, ImagenFondo
from ..models import Pared as ParedModel

H = 500
W = 1000

def generar_imagen(personaje, movimiento, img, paredes):
    personaje = Personaje.objects.filter(nombre=personaje).first()
    jugador = Jugador(personaje)

    jugador.cambiar_imagen(personaje)

    # Tamaño del lienzo
    lh, lw = jugador.image.shape[:2]

    # Posición inicial y velocidad
    x, y = personaje.x, personaje.y

    x,y = jugador.actualizar_posicion(movimiento, paredes)
    personaje.x = x
    personaje.y = y

    personaje.save()

    img[y:y+lh, x:x+lw] = jugador.image

    return img

def cargar_paredes(numero_paredes, reset):
    img = np.full((H, W, 3), 255, dtype=np.uint8)

    img_obj = ImagenFondo.objects.get(nombre='background')
    
    if reset:
        img_obj.paredes.clear()
        for _ in range(numero_paredes):
            # p = Pared(randint(200, 800), 0, 'V', 500)
            # paredes.append(p)

            pared_obj = ParedModel.objects.create(
                x = randint(200, 800),
                y = 0,
                direccion = 'V'
            )
            
            pared_obj.save()
            img_obj.paredes.add(pared_obj)
    
    paredes = img_obj.paredes.all()
    
    for pared in paredes:
        color = obtener_color(pared.color)
        if pared.direccion == 'V':
            cv2.line(img, (pared.x, pared.y), (pared.x, pared.y + 500), color, thickness=5) ## Agregar alto y ancho al modelo de Django
                
        
    return img, paredes

def obtener_color(color):
    color = color.split(',')
    return (int(color[0]), int(color[1]), int(color[2]))
        
        
    
    

