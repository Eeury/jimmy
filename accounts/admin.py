from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, PWDProfile, ClientProfile

# Register your models here.

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User admin"""
    fieldsets = BaseUserAdmin.fieldsets + (
        ('User Type', {'fields': ('is_pwd', 'is_client', 'phone_number')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('User Type', {'fields': ('is_pwd', 'is_client', 'phone_number')}),
    )
    list_display = ['username', 'email', 'is_pwd', 'is_client', 'is_staff']
    list_filter = ['is_pwd', 'is_client', 'is_staff', 'is_active']


@admin.register(PWDProfile)
class PWDProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'disability_type']
    list_filter = ['disability_type']
    search_fields = ['user__username', 'user__email']


@admin.register(ClientProfile)
class ClientProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'client_type']
    list_filter = ['client_type']
    search_fields = ['user__username', 'user__email']
