from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator

# Create your models here.

class User(AbstractUser):
    """Custom User model with PWD and Client flags"""
    is_pwd = models.BooleanField(default=False, help_text="Is this user a Person with Disability?")
    is_client = models.BooleanField(default=False, help_text="Is this user a Client?")
    
    phone_regex = RegexValidator(
        regex=r'^254\d{9}$',
        message="Phone number must be in the format: 254123456789 (12 digits starting with 254)"
    )
    phone_number = models.CharField(validators=[phone_regex], max_length=12, blank=True)
    
    def __str__(self):
        return self.username


class PWDProfile(models.Model):
    """Profile for Person with Disability users"""
    DISABILITY_CHOICES = [
        ('visual', 'Visual Impairment'),
        ('hearing', 'Hearing Impairment'),
        ('physical', 'Physical Disability'),
        ('intellectual', 'Intellectual Disability'),
        ('mental', 'Mental Health Condition'),
        ('other', 'Other'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='pwd_profile')
    disability_type = models.CharField(max_length=50, choices=DISABILITY_CHOICES)
    
    def __str__(self):
        return f"PWD Profile - {self.user.username}"


class ClientProfile(models.Model):
    """Profile for Client users"""
    CLIENT_TYPE_CHOICES = [
        ('freelance', 'Freelance'),
        ('medical', 'Medical'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='client_profile')
    client_type = models.CharField(max_length=20, choices=CLIENT_TYPE_CHOICES)
    
    def __str__(self):
        return f"Client Profile - {self.user.username} ({self.client_type})"
