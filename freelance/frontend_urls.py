from django.urls import path
from . import views

urlpatterns = [
    path('', views.freelance_view, name='freelance'),
    path('jobs/', views.jobs_view, name='jobs'),
]
