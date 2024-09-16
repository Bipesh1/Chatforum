from django.urls import path
from  . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('signin/',views.signin,name='signin'),
    path('uploadprofilepicture/',views.uploadprofilepicture,name='uploadprofilepicture'),
    path('getprofiledata/',views.get_user_profile,name="getprofiledata"),
    path('getusers/',views.getusers,name="getusers"),
    path('deleteusers/',views.deleteusers,name="deleteusers"),
]