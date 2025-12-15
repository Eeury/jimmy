from rest_framework import serializers
from .models import Job, Bid
from accounts.serializers import UserSerializer

class BidSerializer(serializers.ModelSerializer):
    freelancer = UserSerializer(read_only=True)
    
    class Meta:
        model = Bid
        fields = ['id', 'job', 'freelancer', 'proposal', 'amount', 'timeframe', 'resume', 'selected', 'created_at']
        read_only_fields = ['job', 'freelancer', 'selected', 'created_at']


class JobSerializer(serializers.ModelSerializer):
    client = UserSerializer(read_only=True)
    bids = BidSerializer(many=True, read_only=True)
    
    class Meta:
        model = Job
        fields = ['id', 'client', 'title', 'description', 'amount', 'timeframe', 'status', 'created_at', 'bids']
        read_only_fields = ['client', 'created_at', 'bids']
