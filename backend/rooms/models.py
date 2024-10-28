from django.db import models
from django.contrib.auth.models import User
# Create your models here.
class Room(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True,null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    users = models.ManyToManyField(User, related_name='rooms',blank=True)

    def __str__(self):
        return self.name
    
    def thread_count(self):
        return self.threads.count()


class Thread(models.Model):
    room = models.ForeignKey(Room, related_name='threads', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    created_by = models.ForeignKey(User, related_name='threads', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Message(models.Model):
    room= models.ForeignKey(Room, related_name='messages',on_delete=models.CASCADE)
    thread= models.ForeignKey(Thread, related_name='messages',on_delete=models.CASCADE)
    user= models.ForeignKey(User,related_name='messages',on_delete=models.CASCADE)
    content= models.TextField(blank=True,null=True)
    image= models.ImageField(upload_to='image_messages/',blank=True, null=True)
    date_added= models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.username}: {self.content or "Image"}'
