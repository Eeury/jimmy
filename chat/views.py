from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer

User = get_user_model()

class ConversationListView(generics.ListAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.conversations.all()


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def start_conversation(request):
    """Start a conversation with another user"""
    username = request.data.get('username')
    if not username:
        return Response({'error': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        other_user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if other_user == request.user:
        return Response({'error': 'Cannot chat with yourself'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if conversation already exists
    conversations = request.user.conversations.filter(participants=other_user)
    if conversations.exists():
        return Response(ConversationSerializer(conversations.first()).data)
    
    conversation = Conversation.objects.create()
    conversation.participants.add(request.user, other_user)
    return Response(ConversationSerializer(conversation).data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def message_list(request, conversation_id):
    """Get messages or send a message in a conversation"""
    conversation = get_object_or_404(Conversation, id=conversation_id)
    
    if request.user not in conversation.participants.all():
        return Response(status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        messages = conversation.messages.all()
        return Response(MessageSerializer(messages, many=True).data)
    
    elif request.method == 'POST':
        serializer = MessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(sender=request.user, conversation=conversation)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
