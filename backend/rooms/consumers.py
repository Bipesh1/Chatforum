import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.contrib.auth.models import User
from .models import Room, Message, Thread
from django.core.files.base import ContentFile
import base64
from django.conf import settings

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['thread_id']
        self.room_group_name = f'chat_{self.room_name}'
        print(f"Connecting to room: {self.room_group_name}") 

        # Join the room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave the room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)

        # Handle typing notifications
        if 'typing' in text_data_json:
            typing = text_data_json['typing']
            whoIsTyping = text_data_json['sender']

            print(f"Typing notification: {whoIsTyping} is typing in {self.room_group_name}")  # Log the room group and user typing

            # Send typing notification to the room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing_notification',
                    'message': f"{whoIsTyping} is typing..." if typing else "none",
                    'whoIsTyping': whoIsTyping,
                    'sender_channel_name': self.channel_name
                }
            )

        # Handle chat messages (text, image, or both)
        if 'type' in text_data_json and 'sender' in text_data_json and 'roomname' in text_data_json:
            message_type = text_data_json['type']
            sender = text_data_json['sender']
            roomname = text_data_json['roomname']

            # Handle text messages
            if message_type == 'newtext':
                message_content = text_data_json.get('content', "")
                print(message_content)
                # Save the text message to the database
                message_id,date_added=await self.save_message(sender, message_content, roomname)
                
                # Broadcast the message to the room
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message_id':message_id,
                        'content': message_content,
                        'sender': sender,
                        'message_type': 'text',
                        'date_added': date_added.isoformat(),
                    }
                )
            elif message_type=='edited':
                message_id = text_data_json.get('messageID')  
                updated_content = text_data_json.get('editedContent')
                sender= text_data_json['sender'] 
                
                await self.update_message_content(message_id, updated_content)

                # updated_message = await self.get_message_by_id(message_id)

                # Broadcast only the updated message
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'updated_message',  
                        'content': updated_content,
                        'sender': sender,
                        'action': 'edited',     
                        'message_id': message_id,
                    }
                )
            # Handle image messages
            elif message_type == 'images':
                images = text_data_json.get('images', [])
                image_urls=[]
                # Save the image(s) to the database
                for image_data in images:
                    message_id,image_url=await self.save_image_message(sender, image_data, roomname)
                    image_urls.append(image_url)
                # Broadcast image(s) to the room
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message_id':message_id,
                        'sender': sender,
                        'message_type': 'image',
                        'images': image_urls
                    }
                )

            # Handle text and image messages together
            

    async def chat_message(self, event):
        sender = event['sender']
        message_id=event['message_id']
        content = event.get('content',None)
        message_type = event['message_type']
        images = event.get('images', [])
        date_added=event.get('date_added')
        print(images)
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message_id':message_id,
            'content': content,
            'sender': sender,
            'message_type': message_type,
            'images': images,
            'date_added':date_added,
        }))
    async def updated_message(self,event):
        sender= event['sender']
        content= event['content']
        action = event['action']
        message_id = event['message_id']
        
        
        print(content)

        await self.send(text_data=json.dumps({
            
            'message_id': message_id,
            'content':content,
            'sender':sender,
            'action': action,
        }))
    async def typing_notification(self, event):
        message = event['message']
        whoIsTyping = event['whoIsTyping']
        sender_channel_name = event['sender_channel_name']

        # Send typing notification to WebSocket
        if sender_channel_name != self.channel_name:
            await self.send(text_data=json.dumps({
                'message': message,  # "is typing..." or "none"
                'whoIsTyping': whoIsTyping
            }))

    @sync_to_async
    def save_message(self, sender, message, roomname):
        user = User.objects.get(username=sender)
        room = Room.objects.get(name=roomname)
        thread = Thread.objects.get(id=self.room_name)
        message_obj=Message.objects.create(room=room, user=user, thread=thread, content=message)
        return message_obj.id,message_obj.date_added
    @sync_to_async
    def save_image_message(self, sender, image_data, roomname):
        # Decode the base64 image data
        format, imgstr = image_data.split(';base64,')
        ext = format.split('/')[-1]  # Extract the file extension (e.g., png, jpg)
        img_data = ContentFile(base64.b64decode(imgstr), name=f"{sender}_image.{ext}")
        
        # Save the image to the database
        user = User.objects.get(username=sender)
        room = Room.objects.get(name=roomname)
        thread = Thread.objects.get(id=self.room_name)
        
        # Create the message and save the image
        message_obj = Message.objects.create(room=room, user=user, thread=thread, image=img_data)
        
        # Get the domain from settings or use a default value (localhost in this case)
        domain = getattr(settings, 'DOMAIN', 'http://localhost:8000')
        
        # Construct the absolute URL by ensuring no double slashes
        image_absolute_url = f"{domain.rstrip('/')}/{message_obj.image.url.lstrip('/')}"
        
        # Overwrite the image field with the absolute URL

        return message_obj.id,image_absolute_url  # Return the absolute URL if needed



    @sync_to_async
    def update_message_content(self, message_id, updated_content):
       message = Message.objects.filter(id = message_id)
       updatedmessage = message.update(content=updated_content)

       print("Message updated")
       return updatedmessage
    