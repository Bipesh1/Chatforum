from rest_framework import serializers
from .models import Room,Thread
from accounts.serializers import UserSerializer

class RoomSerializer(serializers.ModelSerializer):
    users= UserSerializer(many=True,read_only=True)
    user_count = serializers.SerializerMethodField()
    class Meta:
        model= Room
        fields=['id','name','description','created_at','users', 'user_count']
    
    def get_user_count(self,obj):
        return obj.users.count()

class ThreadSerializer(serializers.ModelSerializer):
    room= RoomSerializer(read_only=True)
    class Meta:
        model= Thread
        fields=['id','room','title','created_by','created_at']
