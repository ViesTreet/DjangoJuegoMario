import cv2
import cv2.aruco as aruco

# Cargar la imagen donde quieres buscar ArUcos
image = cv2.imread("uno_solo.png")  # pon aquí el nombre de tu imagen

# Convertir a escala de grises (mejora la detección)
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Elegir el mismo diccionario que usaste para generar los ArUcos
aruco_dict = aruco.getPredefinedDictionary(aruco.DICT_4X4_50)
parameters = aruco.DetectorParameters()

# Crear el detector
detector = aruco.ArucoDetector(aruco_dict, parameters)

# Detectar marcadores
corners, ids, rejected = detector.detectMarkers(gray)

# Dibujar los marcadores detectados en la imagen
if ids is not None:
    print("ArUcos encontrados:", ids.flatten())
    aruco.drawDetectedMarkers(image, corners, ids)
    print(corners)
else:
    print("No se detectaron ArUcos")

# Mostrar la imagen en una ventana
# Mostrar la imagen en una ventana
cv2.namedWindow("Detección de ArUcos", cv2.WINDOW_NORMAL)  # permite cambiar el tamaño
cv2.resizeWindow("Detección de ArUcos", 800, 600)          # ajusta el tamaño que quieras
cv2.imshow("Detección de ArUcos", image)
cv2.waitKey(0)
cv2.destroyAllWindows()

