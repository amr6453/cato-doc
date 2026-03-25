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

    def __str__(self):
        return f"Patient: {self.user.username}"

class DoctorProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='doctor_profile')
    specialization = models.ForeignKey('clinics.Specialization', on_delete=models.SET_NULL, null=True, related_name='doctors')
    bio = models.TextField(blank=True)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    years_of_experience = models.PositiveIntegerField(default=0)
    clinic_address = models.TextField(blank=True)

    def __str__(self):
        return f"Dr. {self.user.get_full_name() or self.user.username}"

# Signals for automatic profile creation
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        if instance.role == CustomUser.PATIENT:
            PatientProfile.objects.get_or_create(user=instance)
        elif instance.role == CustomUser.DOCTOR:
            DoctorProfile.objects.get_or_create(user=instance)

@receiver(post_save, sender=CustomUser)
def save_user_profile(sender, instance, **kwargs):
    if instance.role == CustomUser.PATIENT:
        if hasattr(instance, 'patient_profile'):
            instance.patient_profile.save()
    elif instance.role == CustomUser.DOCTOR:
        if hasattr(instance, 'doctor_profile'):
            instance.doctor_profile.save()
