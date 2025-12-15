from django.urls import path
from . import views

urlpatterns = [
    path('', views.tubonge_view, name='tubonge'),
]
