from rest_framework import serializers
from .models import Service, Booking
from accounts.serializers import UserSerializer

class BookingSerializer(serializers.ModelSerializer):
    pwd_user = UserSerializer(read_only=True)
    
    class Meta:
        model = Booking
        fields = ['id', 'service', 'pwd_user', 'proposal', 'amount', 'session_time', 'file', 'selected', 'created_at']
        read_only_fields = ['service', 'pwd_user', 'selected', 'created_at']


class ServiceSerializer(serializers.ModelSerializer):
    provider = UserSerializer(read_only=True)
    bookings = BookingSerializer(many=True, read_only=True)
    
    class Meta:
        model = Service
        fields = ['id', 'provider', 'title', 'description', 'session_timeframe', 'amount', 'status', 'created_at', 'bookings']
        read_only_fields = ['provider', 'created_at', 'bookings']
