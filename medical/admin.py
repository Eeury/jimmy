from django.contrib import admin
from .models import Service, Booking

# Register your models here.

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['title', 'provider', 'amount', 'session_timeframe', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['title', 'provider__username', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['pwd_user', 'service', 'amount', 'session_time', 'selected', 'created_at']
    list_filter = ['selected', 'created_at']
    search_fields = ['pwd_user__username', 'service__title']
    readonly_fields = ['created_at']
