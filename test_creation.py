import sys
import os
import django

sys.path.append(os.path.join(os.getcwd(), 'backend'))

# Set the environment variable for Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.accounts.models import CustomUser, PatientProfile, DoctorProfile
from apps.appointments.models import Appointment, Availability
from datetime import date, time

try:
    # Set the doctor and patient
    doctor_profile = DoctorProfile.objects.get(id=1) # amr kk's profile
    patient_user = CustomUser.objects.get(username='amr66') # amr66's account
    patient_profile = patient_user.patient_profile
    
    test_date = date(2026, 3, 25)
    test_time = time(18, 0)
    
    # Check if the slot exists and is available
    slot = Availability.objects.filter(
        doctor=doctor_profile, 
        date=test_date, 
        start_time=test_time,
        is_booked=False
    ).first()
    
    if not slot:
        print(f"Slot {test_date} {test_time} not found or already booked.")
    else:
        # Try to create the appointment
        print(f"Found slot for {doctor_profile.user.username} with patient {patient_user.username}. Creating...")
        Appointment.objects.create(
            doctor=doctor_profile,
            patient=patient_profile,
            date=test_date,
            time_slot=test_time,
            status='PENDING'
        )
        print("Appointment created successfully!")

except Exception as e:
    print(f"Failed to create appointment: {e}")
