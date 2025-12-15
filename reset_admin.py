import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'able_connect.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()

# Get credentials from env or use defaults (matching existing logic)
username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'Admin')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'AdminPassword123')

print(f"Attempting to reset/create superuser: {username}")

try:
    if User.objects.filter(username=username).exists():
        print(f"User {username} exists. Resetting password...")
        user = User.objects.get(username=username)
        user.set_password(password)
        user.is_superuser = True
        user.is_staff = True
        user.save()
        print(f"Password reset for user: {username}")
    else:
        print(f"User {username} does not exist. Creating...")
        User.objects.create_superuser(username, email, password)
        print(f"Superuser created: {username}")
except Exception as e:
    print(f"An error occurred: {str(e)}")
