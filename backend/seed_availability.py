import os
import django
import sys
from datetime import date, time, timedelta

# Set up Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.accounts.models import DoctorProfile
from apps.appointments.models import Availability

def seed_availability():
    doctors = DoctorProfile.objects.all()
    if not doctors:
        print("No doctors found to seed availability.")
        return

    today = date.today()
    tomorrow = today + timedelta(days=1)
    
    slots = [
        time(9, 0), time(10, 0), time(11, 0),
        time(13, 0), time(14, 0), time(15, 0)
    ]

    for doctor in doctors:
        print(f"Seeding availability for {doctor}...")
        for day in [today, tomorrow]:
            for slot_time in slots:
                Availability.objects.get_or_create(
                    doctor=doctor,
                    date=day,
                    start_time=slot_time,
                    end_time=(django.utils.timezone.datetime.combine(day, slot_time) + timedelta(hours=1)).time(),
                    is_booked=False
                )
    print("Seeding complete.")

if __name__ == "__main__":
    seed_availability()
