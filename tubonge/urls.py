from django.urls import path
from . import views

urlpatterns = [
    path('posts/', views.PostListCreateView.as_view(), name='post-list-create'),
    path('posts/<int:pk>/like/', views.like_post, name='like-post'),
    path('posts/<int:pk>/comment/', views.add_comment, name='add-comment'),
]
