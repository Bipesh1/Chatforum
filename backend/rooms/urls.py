from django.urls import path
from  . import views

urlpatterns = [
    path('deleterooms/<str:roomname>', views.deleterooms, name='deleterooms'),
    path('deletethreads/<str:roomname>/<int:threadid>/', views.deletethreads, name='deletethreads'),
    path('getavailablerooms/', views.getavailablerooms, name='getavailablerooms'),
    path('addrooms/', views.addrooms, name='addrooms'),
    path('<str:room_name>/getthreads/',views.getthreads,name='getthreads'),
    path('<str:room_name>/joinroom/',views.joinroom,name='joinroom'),
    path('<str:room_name>/addthread/',views.addthreads,name='addthreads'),
    path('getMessages/<int:threadid>/',views.getMessages,name='getMessages'),
    path('getJoinedThreads/',views.getJoinedThreads,name='getJoinedThreas')
]   