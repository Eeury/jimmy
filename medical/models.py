from django.db import models
from django.conf import settings

# Create your models here.

class Service(models.Model):
    """Medical services posted by clients"""
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('closed', 'Closed'),
    ]
    
    provider = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posted_services')
    title = models.CharField(max_length=200)
    description = models.TextField()
    session_timeframe = models.CharField(max_length=100, help_text="e.g., '1 hour', '30 minutes'")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} by {self.provider.username}"


class Booking(models.Model):
    """Bookings for medical services by PWD users"""
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='bookings')
    pwd_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    proposal = models.TextField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    session_time = models.DateTimeField()
    file = models.FileField(upload_to='bookings/files/', blank=True, null=True, help_text="Upload image or PDF")
    selected = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['service', 'pwd_user']
    
    def __str__(self):
        return f"Booking by {self.pwd_user.username} for {self.service.title}"
