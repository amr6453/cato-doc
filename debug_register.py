import os
import django
import sys

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.accounts.serializers import CustomRegisterSerializer
from django.test import RequestFactory
from apps.accounts.models import CustomUser

def debug_register():
    factory = RequestFactory()
    request = factory.post('/api/registration/')
    
    # Add session middleware manually if needed, or just mock it
    from django.contrib.sessions.middleware import SessionMiddleware
    middleware = SessionMiddleware(lambda r: None)
    middleware.process_request(request)
    request.session.save()
    
    unique_suffix = str(os.getpid()) + str(int(django.utils.timezone.now().timestamp()))
    data = {
        'username': 'debugtestuser' + unique_suffix,
        'email': f'debug_{unique_suffix}@test.com',
        'password': 'Password123!',
        'password1': 'Password123!',
        'password2': 'Password123!',
        'first_name': 'Debug',
        'last_name': 'User',
        'role': 'PATIENT'
    }
    
    serializer = CustomRegisterSerializer(data=data)
    if serializer.is_valid():
        print("Serializer is valid.")
        try:
            user = serializer.save(request)
            print(f"User created: {user}")
        except Exception as e:
            import traceback
            print("Error during save:")
            traceback.print_exc()
    else:
        print(f"Serializer errors: {serializer.errors}")

if __name__ == "__main__":
    debug_register()
