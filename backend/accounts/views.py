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
        isSuperUser= False
        
        if user:
            if hasattr(user, 'userprofile'):
                hasUserProfile = True
            login(request,user)  
            if user.is_superuser:
                  request.session['isAdmin'] = True
                  isSuperUser= True
            else:
                request.session['isAdmin'] = False
            response_data = {
                'status': 'successful',
                'user': str(request.user.is_authenticated),
                'message': 'Login Successful',
                'hasUserProfilePicture': hasUserProfile,
                'isSuperUser': isSuperUser
            }
            response = JsonResponse(response_data)
            if user.is_superuser:
                 response.set_cookie('isAdmin', True, max_age=3600, httponly=True)
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
    user_serializer=UserSerializer(user)
    if(not UserProfile.objects.filter(user=user).exists()):
        data={"user":user_serializer.data}
        return JsonResponse(data)
    profile= UserProfile.objects.get(user=user)
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




@api_view(['POST'])
def updateInfo(request):
    user = request.user
    newusername = request.data.get('username')
    passworddata = request.data.get('data', {})
    oldpassword = passworddata.get('oldpassword')
    newpassword = passworddata.get('newpassword')
    type = request.data.get('type')

    if not user.is_authenticated:
        return JsonResponse({"status": "error", "message": "User not authenticated"})

    # Update username
    if type == "username":
        if User.objects.filter(username=newusername).exists():
            return JsonResponse({'status': 'error', 'message': 'Username already exists'})
        serializer = UserSerializer(user, data={"username": newusername}, partial=True)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse({"status": "successful", "message": "Username updated successfully"})
        return JsonResponse({"status": "error", "message": "Invalid username data"})

    # Update password
    if type == "password":
        print("hello")
        if not oldpassword or not newpassword:
            return JsonResponse({"status": "error", "message": "Both old and new passwords are required"})
        
        # Verify the old password
        if not user.check_password(oldpassword):
            return JsonResponse({"status": "error", "message": "Old password is incorrect"})
        
        # Update to the new password
        user.set_password(newpassword)
        user.save()
        return JsonResponse({"status": "successful", "message": "Password updated successfully"})

    return JsonResponse({"status": "error", "message": "Invalid type or no type provided"})

