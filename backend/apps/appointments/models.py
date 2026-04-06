from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from apps.notifications.models import Notification

class Availability(models.Model):
    doctor = models.ForeignKey('accounts.DoctorProfile', on_delete=models.CASCADE, related_name='availabilities')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_booked = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = "Availabilities"
        ordering = ['date', 'start_time']

    def __str__(self):
        return f"{self.doctor} - {self.date} ({self.start_time}-{self.end_time})"

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]

    doctor = models.ForeignKey('accounts.DoctorProfile', on_delete=models.CASCADE, related_name='appointments')
    patient = models.ForeignKey('accounts.PatientProfile', on_delete=models.CASCADE, related_name='appointments')
    date = models.DateField()
    time_slot = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Appointment: {self.patient} with {self.doctor} on {self.date}"

@receiver(post_save, sender=Appointment)
def create_appointment_notification(sender, instance, created, **kwargs):
    if created:
        try:
            doctor_user = instance.doctor.user
            message = f"New appointment booked: {instance.patient.user.get_full_name() or instance.patient.user.username} on {instance.date} at {instance.time_slot}"
            
            # 1. Save Notification to DB
            notification = Notification.objects.create(
                user=doctor_user,
                message=message
            )
            
            # 2. Send Real-time notification via Channels
            channel_layer = get_channel_layer()
            if channel_layer:
                group_name = f"user_notifications_{doctor_user.id}"
                
                async_to_sync(channel_layer.group_send)(
                    group_name,
                    {
                        "type": "notification_message",
                        "message": message,
                        "notification_id": notification.id,
                        "created_at": str(notification.created_at)
                    }
                )
        except Exception as e:
            # We don't raise the error here to avoid crashing the main appointment booking logic
            print(f"Error sending real-time notification: {e}")
