from django.shortcuts import render

# Create your views here.

def index(request):
    """Homepage view"""
    return render(request, 'core/index.html')
