from django.db import models
from django.conf import settings

# Create your models here.

class Job(models.Model):
    """Freelance job postings by clients"""
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('closed', 'Closed'),
    ]
    
    client = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posted_jobs')
    title = models.CharField(max_length=200)
    description = models.TextField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    timeframe = models.CharField(max_length=100, help_text="e.g., '2 weeks', '1 month'")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} by {self.client.username}"


class Bid(models.Model):
    """Bids on jobs by PWD users"""
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='bids')
    freelancer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bids')  
    proposal = models.TextField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    timeframe = models.CharField(max_length=100)
    resume = models.FileField(upload_to='bids/resumes/')
    selected = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['job', 'freelancer']
    
    def __str__(self):
        return f"Bid by {self.freelancer.username} on {self.job.title}"
