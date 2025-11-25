from django.shortcuts import render

def selector(request):
    return render(request, "game/index.html")

def game_view(request,personaje):
    return render(request, "game/juego.html", {"personaje": personaje})