from django.urls import path
from . import views

urlpatterns = [
    path('', views.medical_view, name='medical'),
    path('services/', views.services_view, name='services'),
]
