from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    DOCTOR = 'DOCTOR'
    PATIENT = 'PATIENT'
    ADMIN = 'ADMIN'
    
    ROLE_CHOICES = [
        (DOCTOR, 'Doctor'),
        (PATIENT, 'Patient'),
        (ADMIN, 'Admin'),
    ]
    
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=PATIENT)

    def __str__(self):
        return f"{self.username} ({self.role})"

class PatientProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='patient_profile')
    date_of_birth = models.DateField(null=True, blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    medical_history = models.TextField(blank=True)
    image = models.ImageField(upload_to='profiles/patients/', null=True, blank=True)

    def __str__(self):
        return f"Patient: {self.user.username}"

class DoctorProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='doctor_profile')
    specialization = models.ForeignKey('clinics.Specialization', on_delete=models.SET_NULL, null=True, related_name='doctors')
    bio = models.TextField(blank=True)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    years_of_experience = models.PositiveIntegerField(default=0)
    clinic_address = models.TextField(blank=True)
    image = models.ImageField(upload_to='profiles/doctors/', null=True, blank=True)

    def __str__(self):
        return f"Dr. {self.user.get_full_name() or self.user.username}"

# Removed automatic profile creation signals to enforce Phase 2 profile completion flow.
