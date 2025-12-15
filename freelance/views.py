from django.shortcuts import render
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Job, Bid
from .serializers import JobSerializer, BidSerializer

# Frontend views
def freelance_view(request):
    return render(request, 'freelance/jobs.html')

def jobs_view(request):
    return render(request, 'freelance/jobs.html')


class JobListCreateView(generics.ListCreateAPIView):
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Clients see their own jobs, PWDs see all open jobs
        user = self.request.user
        if user.is_client:
            return Job.objects.filter(client=user)
        return Job.objects.filter(status='open')

    def perform_create(self, serializer):
        if not self.request.user.is_client:
            raise permissions.PermissionDenied("Only clients can post jobs.")
        serializer.save(client=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def close_job(request, pk):
    try:
        job = Job.objects.get(pk=pk, client=request.user)
    except Job.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    job.status = 'closed'
    job.save()
    return Response({'status': 'closed'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def submit_bid(request, pk):
    try:
        job = Job.objects.get(pk=pk)
    except Job.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if not request.user.is_pwd:
        return Response({'error': 'Only PWDs can bid on jobs'}, status=status.HTTP_403_FORBIDDEN)

    serializer = BidSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(freelancer=request.user, job=job)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
