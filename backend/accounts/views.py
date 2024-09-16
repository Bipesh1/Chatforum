from django.http import JsonResponse
from rest_framework.decorators import api_view
from django.contrib.auth.models import User,AnonymousUser
from .serializers import UserSerializer,UserProfileSerializer
from .models import UserProfile
from django.contrib.auth import authenticate
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ObjectDoesNotExist





@api_view(['POST'])
def register(request):
    if  request.method== 'POST':
        print(request.data)
        registerserializer=UserSerializer(data=request.data)
        if registerserializer.is_valid():
            registerserializer.save()
            return JsonResponse({'status':'successful','message':'Registration Succesful'}) 
        return JsonResponse({'status':'error','message':'Registration Failure'}) 


@api_view(['POST'])
def signin(request):
    print(f"Session key before login: {request.session.session_key}")
    if request.method== 'POST':
        print(request.data)
        try:
            # Try to retrieve the user by email
            user = User.objects.get(email=request.data['email'])
        except User.DoesNotExist:
            # No user with this email exists
            return JsonResponse({'status': 'error', 'message': "User doesn't exist"})

        # username= request.data['username']
        password= request.data['password']

        user= authenticate(username=user.username,password=password)
        hasUserProfile= False
        is_superuser = False
        
        if user:
            if hasattr(user, 'userprofile'):
                hasUserProfile = True
            login(request,user)  
            if user.is_superuser:
                is_superuser=True
            print(is_superuser)
            response_data = {
                'status': 'successful',
                'user': str(request.user.is_authenticated),
                'message': 'Login Successful',
                'hasUserProfilePicture': hasUserProfile,
                'is_superuser': is_superuser
            }
            response = JsonResponse(response_data)
            print(f"Session key after login: {request.session.session_key}")
            print(f"Session data: {request.session.items()}")
            return response
        else:
            return JsonResponse({'status':'error','message':"Login not Succesful"})


@api_view(['POST'])
def uploadprofilepicture(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    profile, created = UserProfile.objects.get_or_create(user=user)
    serializer = UserProfileSerializer(profile, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return JsonResponse({'status':'Successful','message':'Succesfully uploaded profile picture'})
    else:
        return JsonResponse({'status':'error','message':'Failed to upload profilepicture'}, status=status.HTTP_400_BAD_REQUEST)

@login_required
@api_view(['GET'])
def get_user_profile(request):
    user=request.user
    if not user.is_authenticated:
        return JsonResponse({"status":"error","message":"User not authenticated"})
    
    profile= UserProfile.objects.get(user=user)
    user_serializer=UserSerializer(user)
    profile_serializer = UserProfileSerializer(profile,context={'request': request})
    data={
        "user":user_serializer.data,
        "profile":profile_serializer.data
    }
    return JsonResponse(data)

@api_view(['GET'])
def getusers(request):
    try:
        users = User.objects.all()
        if(not users):
            return JsonResponse({'status':'error','message':'User doesnt exist'})
        serializer = UserSerializer(users,many=True)
        return JsonResponse({'status':'successful','users':serializer.data})
    except ObjectDoesNotExist: 
        return JsonResponse({"status": "error", "message": "Failed"}, status=404)
    

@api_view(['POST'])
def deleteusers(request):
    try:
        userid = request.data.get('userid')
        print(userid)
        deletinguser = User.objects.get(id=userid)
        deletinguser.delete()
        return JsonResponse({'status':'successful','message':'User Deleted Successfully'})
    except ObjectDoesNotExist:
        return JsonResponse({"status": "error", "message": "User not found"}, status=404)