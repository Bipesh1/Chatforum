from rest_framework import serializers
from .models import Room,Thread,Message
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
    created_by= UserSerializer(read_only=True)
    room= RoomSerializer(read_only=True)
    class Meta:
        model= Thread
        fields=['id','room','title','created_by','created_at']

class MessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'room', 'thread', 'user', 'content', 'image', 'date_added','upvote','upvoted_by','downvote','downvoted_by']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image:
            # Build the absolute URL using request.build_absolute_uri()
            return request.build_absolute_uri(obj.image.url)
        return None

