from django.contrib import admin
from .models import Job, Bid

# Register your models here.

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['title', 'client', 'amount', 'timeframe', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['title', 'client__username', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Bid)
class BidAdmin(admin.ModelAdmin):
    list_display = ['freelancer', 'job', 'amount', 'selected', 'created_at']
    list_filter = ['selected', 'created_at']
    search_fields = ['freelancer__username', 'job__title']
    readonly_fields = ['created_at']
