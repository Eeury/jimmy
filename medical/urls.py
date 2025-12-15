from django.urls import path
from . import views

urlpatterns = [
    path('services/', views.ServiceListCreateView.as_view(), name='service-list-create'),
    path('services/<int:pk>/close/', views.close_service, name='close-service'),
    path('services/<int:pk>/book/', views.book_service, name='book-service'),
]
