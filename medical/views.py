from django.shortcuts import render
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Service, Booking
from .serializers import ServiceSerializer, BookingSerializer

# Frontend views
def medical_view(request):
    return render(request, 'medical/services.html')

def services_view(request):
    return render(request, 'medical/services.html')


class ServiceListCreateView(generics.ListCreateAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Providers see their own services, PWDs see all open services
        user = self.request.user
        if user.is_client:
            return Service.objects.filter(provider=user)
        return Service.objects.filter(status='open')

    def perform_create(self, serializer):
        if not self.request.user.is_client:
            raise permissions.PermissionDenied("Only clients can post services.")
        serializer.save(provider=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def close_service(request, pk):
    try:
        service = Service.objects.get(pk=pk, provider=request.user)
    except Service.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    service.status = 'closed'
    service.save()
    return Response({'status': 'closed'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def book_service(request, pk):
    try:
        service = Service.objects.get(pk=pk)
    except Service.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if not request.user.is_pwd:
        return Response({'error': 'Only PWDs can book services'}, status=status.HTTP_403_FORBIDDEN)

    serializer = BookingSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(pwd_user=request.user, service=service)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
