from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from .models import Room,Thread,Message
from django.http import JsonResponse
from .serializers import RoomSerializer,ThreadSerializer,MessageSerializer
from django.core.exceptions import ObjectDoesNotExist
from django.core.paginator import Paginator
import json
import pandas as pd
import numpy as np
import re
from numpy.linalg import norm


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
        print(user)
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
       
       
@api_view(['GET'])
def getMessages(request, threadid):
    thread = Thread.objects.get(id=threadid)
    messages = Message.objects.filter(thread=thread).order_by('-date_added')
    page_number = request.GET.get('page', 1)
    paginator = Paginator(messages, 7)
    page_obj = paginator.get_page(page_number)
    
    # Pass the request as context to the serializer
    serializer = MessageSerializer(page_obj, many=True, context={'request': request})
    print(serializer.data)  # Check if the absolute URLs are generated correctly
    
    if not messages:
        return JsonResponse({"message": "No message", "status": "error"})
    
    return JsonResponse({"status": "successful", "message": serializer.data,"has_next": page_obj.has_next(),  })

@api_view(['GET'])
def getJoinedThreads(request):
    user= request.user
    threads= Thread.objects.filter(created_by=user)
    if threads:
        serializer= ThreadSerializer(threads, many=True)
        return JsonResponse({"status":"sucessful", "data":serializer.data})
    else:
        return JsonResponse({"message":"No Threads","status":"error"})


@api_view(['GET'])
def handleUpVote(request, messageid):
    # Check if the user is authenticated
    if not request.user.is_authenticated:
        return JsonResponse({"status": "error", "message": "User not authenticated"})

    try:
        # Fetch the message
        message = Message.objects.get(id=messageid)
    except Message.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Message not found"})

    # Check if the user already upvoted
    if request.user in message.upvoted_by.all():
        return JsonResponse({"status": "error", "message": "User already upvoted this message"})
    if request.user in message.downvoted_by.all():
        message.downvote-=1
        message.downvoted_by.remove(request.user)
    # Update upvote count and add user to `upvoted_by`
    message.upvote += 1
    message.upvoted_by.add(request.user)
    message.save()

    # Return success response
    return JsonResponse({
        "status": "successful",
        "message": "Message upvoted",
        "new_upvote_count": message.upvote
    })
@api_view(['GET'])
def handleDownVote(request, messageid):
    # Check if the user is authenticated
    if not request.user.is_authenticated:
        return JsonResponse({"status": "error", "message": "User not authenticated"})

    try:
        # Fetch the message
        message = Message.objects.get(id=messageid)
    except Message.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Message not found"})

    # Check if the user already upvoted
    if request.user in message.downvoted_by.all():
        return JsonResponse({"status": "error", "message": "User already downvoted this message"})
    if request.user in message.upvoted_by.all():
        message.upvote-=1
        message.upvoted_by.remove(request.user)
    # Update upvote count and add user to `upvoted_by`
    message.downvote += 1
    message.downvoted_by.add(request.user)
    message.save()

    # Return success response
    return JsonResponse({
        "status": "successful",
        "message": "Message downvoted",
        "new_upvote_count": message.downvote
    })

@api_view(['POST'])
def getrelatedthreads(request, room_name):
    query= request.data.get("query")
    print(query)
    tokens=tokenizequery(query)
    embeddings= loadembeddings(r"E:\questions\word_embeddings.csv")
    related_words = set()
    for token in tokens:
        related_words.update(find_similar_words(token, embeddings))
    room= Room.objects.get(name=room_name)
    threads = Thread.objects.filter(room=room).values('id','title','created_by__username')
    thread_data = [{'title': thread['title'],'id':thread['id'],'created_by':thread["created_by__username"]} for thread in threads]
    matching_threads = search_threads_by_words(related_words, thread_data)
    print(matching_threads)
    return JsonResponse({'matching_threads': matching_threads})

def loadembeddings(filepath):
   df= pd.read_csv(filepath)
   embeddings={row['Word']:np.array(row[1:],dtype=float) for _,row in df.iterrows()}
   return embeddings

def findrelatedthreads():
    pass

def tokenizequery(query):
    tokens = re.findall(r'\b\w+\b', query.lower())
    return tokens

def cosine_similarity(vec1, vec2):
    return np.dot(vec1, vec2) / (norm(vec1) * norm(vec2))

def find_similar_words(word, embeddings, top_n=30):
    word_vector = embeddings.get(word)
    if word_vector is None:
        return []

    similar_words = []
    for vocab_word, vocab_vector in embeddings.items():
        similarity = cosine_similarity(word_vector, vocab_vector)
        similar_words.append((vocab_word, similarity))

    # Sort by similarity and return the top N similar words
    similar_words.sort(key=lambda x: x[1], reverse=True)
    return [w for w, _ in similar_words[:top_n]]

def search_threads_by_words(words, thread_data):
    # Find threads containing at least one of the related words
    print(words)
    matching_threads = []
    for thread in thread_data:
        for word in words:
            if word in thread['title'].lower():
                matching_threads.append(thread)
                break  # No need to check more words for this thread

    return matching_threads
