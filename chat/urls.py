from django.urls import path
from . import views

urlpatterns = [
    path('conversations/', views.ConversationListView.as_view(), name='conversation-list'),
    path('conversations/start/', views.start_conversation, name='start-conversation'),
    path('conversations/<int:conversation_id>/messages/', views.message_list, name='message-list'),
]
