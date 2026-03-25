from django.contrib import admin
from .models import Availability, Appointment

@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ('doctor', 'date', 'start_time', 'end_time', 'is_booked')
    list_filter = ('doctor', 'date', 'is_booked')
    search_fields = ('doctor__user__username',)

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('patient', 'doctor', 'date', 'time_slot', 'status')
    list_filter = ('status', 'date', 'doctor', 'patient')
    search_fields = ('patient__user__username', 'doctor__user__username')

# Register your models here.
