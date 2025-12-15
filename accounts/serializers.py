from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import PWDProfile, ClientProfile

User = get_user_model()


class PWDProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PWDProfile
        fields = ['disability_type']


class ClientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientProfile
        fields = ['client_type']


class UserSerializer(serializers.ModelSerializer):
    pwd_profile = PWDProfileSerializer(required=False)
    client_profile = ClientProfileSerializer(required=False)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'phone_number', 'is_pwd', 'is_client', 
                  'pwd_profile', 'client_profile']
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        pwd_profile_data = validated_data.pop('pwd_profile', None)
        client_profile_data = validated_data.pop('client_profile', None)
        password = validated_data.pop('password')
        
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        if pwd_profile_data and validated_data.get('is_pwd'):
            PWDProfile.objects.create(user=user, **pwd_profile_data)
        
        if client_profile_data and validated_data.get('is_client'):
            ClientProfile.objects.create(user=user, **client_profile_data)
        
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
