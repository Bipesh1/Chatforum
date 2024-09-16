from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from .models import Room,Thread
from django.http import JsonResponse
from .serializers import RoomSerializer,ThreadSerializer
from django.core.exceptions import ObjectDoesNotExist
import json

@api_view(['GET'])
def getavailablerooms(request):
    rooms=Room.objects.all()
    serializer= RoomSerializer(rooms,many=True)
    # print(serializer.data)

    if(not rooms):
        return JsonResponse({"status":"error","message":"No rooms available"})
    return JsonResponse({"status":"successful",'rooms':serializer.data})



@api_view(['GET'])
def getthreads(request, room_name):
    try:
        room = Room.objects.get(name=room_name)
    except ObjectDoesNotExist:
        return JsonResponse({"status": "error", "message": "Room not found"}, status=404)

    threads = Thread.objects.filter(room=room)

    if not threads.exists():  
        return JsonResponse({"status": "error", "message": "No threads available"}, status=200)

    
    serializer = ThreadSerializer(threads, many=True)
    return JsonResponse({'status': 'successful', 'threads': serializer.data})


@api_view(['GET'])
def joinroom(request,room_name):
    room= Room.objects.get(name=room_name)
    user= request.user
    if user.is_authenticated:
        room.users.add(user)
        return JsonResponse({"status":"successful","message":"Room joined successfully"})
    return JsonResponse({"status":"error","message":"Cannot join the room"})


@api_view(['POST'])
def addthreads(request,room_name):
    if request.method== "POST":
        room =Room.objects.get(name=room_name)
        user= request.user
        title= request.data["title"]
        if room and user and title:  
            Thread.objects.create(room=room, title=title, created_by=user)
            return JsonResponse({"status":"successful","message":"Updated Sucessfully"})
        return JsonResponse({"status":"error","message":"Invalid Data"})
        
        
api_view(['GET'])
def deleterooms(request,roomname):
    try:
        deletingroom = Room.objects.get(name=roomname)
        deletingroom.delete()
        return JsonResponse({"status":"successful","message":"All rooms deleted"})
    except ObjectDoesNotExist:
        return JsonResponse({"status": "error", "message": "Room not found"})
    
@api_view(['GET'])
def deletethreads(request,roomname,threadid):
    try:
        deletingthread = Thread.objects.get(id=threadid)
        deletingthread.delete()
        return JsonResponse({"status":"successful","message":"deleted succesfully"})
    except ObjectDoesNotExist:
        return JsonResponse({"status": "error", "message": "Thread not found"})

@api_view(['POST'])
def addrooms(request):
    if request.method== 'POST':
       serializer= RoomSerializer(data=request.data)
       if serializer.is_valid():
           serializer.save()
           return JsonResponse({"status":"successful","message":"added room succesfully"})
    return JsonResponse({"status":"error","message":"cant add room"})
       
       
