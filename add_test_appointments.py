from apps.accounts.models import CustomUser, DoctorProfile, PatientProfile
from apps.appointments.models import Appointment, Availability
from datetime import date, time

try:
    doctor_user = CustomUser.objects.filter(first_name__icontains='amr', last_name__icontains='kk').first()
    if not doctor_user:
        # Try finding by first name 'amr kk'
        doctor_user = CustomUser.objects.filter(first_name__icontains='amr kk').first()

    if not doctor_user:
        print("Doctor 'amr kk' not found.")
        exit(1)

    doctor_profile = doctor_user.doctor_profile
    patient_profile = PatientProfile.objects.first() # Just use the first available patient for testing

    if not patient_profile:
        print("No patient profile found. Creating a test patient...")
        patient_user = CustomUser.objects.create_user(username='test_patient', password='password123', role='PATIENT')
        patient_profile = PatientProfile.objects.get(user=patient_user)

    test_date = date(2026, 3, 26)
    slots = [time(10, 0), time(11, 0), time(14, 0), time(15, 0)]

    for slot_time in slots:
        # Create availability slot
        avail, created = Availability.objects.get_or_create(
            doctor=doctor_profile,
            date=test_date,
            start_time=slot_time,
            defaults={'end_time': time(slot_time.hour, 30), 'is_booked': True}
        )
        if not created:
            avail.is_booked = True
            avail.save()

        # Create appointment
        Appointment.objects.create(
            doctor=doctor_profile,
            patient=patient_profile,
            date=test_date,
            time_slot=slot_time,
            status='PENDING'
        )
        print(f"Created appointment for {doctor_user.first_name} at {slot_time}")

except Exception as e:
    print(f"Error: {e}")
