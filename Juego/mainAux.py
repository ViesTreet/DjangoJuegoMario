import cv2
import cv2.aruco as aruco
import numpy as np
import os
import platform

def centroAruco(cornerAruco):
    pts = cornerAruco.reshape((4,2))   
    cX = int(pts[:,0].mean())          
    cY = int(pts[:,1].mean())          
    return [cX, cY]

import numpy as np

def graduacion_mas_cercana(listaGraduacion, aruco_id_centro):
    min_dist = float('inf')
    indice_cercano = None

    for idx, punto in listaGraduacion.items():
        dist = np.linalg.norm(np.array(punto) - np.array(aruco_id_centro))
        if dist < min_dist:
            min_dist = dist
            indice_cercano = idx

    return indice_cercano

def set_volume_linux(volumen):
    # volumen: 0-100
    os.system(f"pactl set-sink-volume @DEFAULT_SINK@ {volumen}%")


aruco_dict = aruco.getPredefinedDictionary(aruco.DICT_4X4_50)
parameters = aruco.DetectorParameters()

detector = aruco.ArucoDetector(aruco_dict, parameters)

opcion = int(input("Desea usar la camara en vivo(marque 1) o un video(marque 2): "))
if opcion==1:
    cap = cv2.VideoCapture(0)
else :
    cap = cv2.VideoCapture("rutaVideo") #rutaDelVideo


cv2.namedWindow("Detección en cámara", cv2.WINDOW_NORMAL)
cv2.resizeWindow("Detección en cámara", 800, 600)

while True:
    ret, frame = cap.read()
    if not ret:
        print("No se pudo acceder a la cámara")
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    corners, ids, rejected = detector.detectMarkers(gray)

    if ids is not None:
        aruco.drawDetectedMarkers(frame, corners, ids)

        ids_list = ids.flatten()

        centros = {}
        for i, corner in zip(ids_list, corners):
            centro = centroAruco(corner)
            centros[i] = centro
            cv2.circle(frame, tuple(centro), 5, (0,0,255), -1)  

        if 0 in centros and 1 in centros:
            p0 = np.array(centros[0])  
            p1 = np.array(centros[1]) 


            cv2.line(frame, tuple(p0), tuple(p1), (0,255,0), 2)

            listaGraduacion={}
            for i in range(11):  
                t = i / 10
                punto = (1 - t) * p0 + t * p1
                punto = tuple(np.int32(punto))
                listaGraduacion[i]=punto
                cv2.circle(frame, punto, 4, (255,0,0), -1)
            if 2 in centros:
                p2 = np.array(centros[2]) 
                graduacionCercana=graduacion_mas_cercana(listaGraduacion,p2)
                for z in range(11):
                    if z==graduacionCercana:
                        cv2.line(frame, listaGraduacion[z], tuple(p2), (0,0,255), 2)
                    else:
                        cv2.line(frame, listaGraduacion[z], tuple(p2), (255,0,0), 2)


                volumen = graduacionCercana * 10  # porcentaje

                set_volume_linux(volumen)

    cv2.imshow("Detección en cámara", frame)
  
    key = cv2.waitKey(1) & 0xFF
    if key == 27:  
        break

cap.release()
cv2.destroyAllWindows()
