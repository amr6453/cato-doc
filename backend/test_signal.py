import os
import django
import sys

# Set up Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.accounts.models import CustomUser, PatientProfile

def test_signal():
    username = "signal_test_user"
    # Delete if exists
    CustomUser.objects.filter(username=username).delete()
    
    print(f"Creating user {username}...")
    user = CustomUser.objects.create_user(username=username, password="password123", email="test@test.com")
    
    # Refresh from DB
    user.refresh_from_db()
    print(f"User role: {user.role}")
    
    has_profile = hasattr(user, 'patient_profile')
    print(f"PatientProfile exists: {has_profile}")
    
    if not has_profile:
        print("SIGNAL FAILED TO FIRE OR CREATE PROFILE.")
    else:
        print("SIGNAL WORKED!")

if __name__ == "__main__":
    test_signal()
