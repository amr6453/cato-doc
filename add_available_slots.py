from apps.accounts.models import CustomUser, DoctorProfile
from apps.appointments.models import Availability
from datetime import date, time, timedelta

try:
    doctor_profile = DoctorProfile.objects.get(id=1)
    
    today = date(2026, 3, 25)
    tomorrow = date(2026, 3, 26)
    
    # Times for available slots (NOT booked)
    available_times = [time(16, 0), time(17, 0), time(18, 0)]
    
    for d in [today, tomorrow]:
        for t in available_times:
            # Create availability slot
            avail, created = Availability.objects.get_or_create(
                doctor=doctor_profile,
                date=d,
                start_time=t,
                defaults={'end_time': time(t.hour, 30), 'is_booked': False}
            )
            if not created:
                avail.is_booked = False
                avail.save()
            print(f"Created available slot for {d} at {t}")

except Exception as e:
    print(f"Error: {e}")
