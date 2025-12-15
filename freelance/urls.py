from django.urls import path
from . import views

urlpatterns = [
    path('jobs/', views.JobListCreateView.as_view(), name='job-list-create'),
    path('jobs/<int:pk>/close/', views.close_job, name='close-job'),
    path('jobs/<int:pk>/bid/', views.submit_bid, name='submit-bid'),
]
