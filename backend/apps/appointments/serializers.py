from rest_framework import serializers
from .models import Appointment, Availability
from apps.accounts.serializers import DoctorProfileShortSerializer, PatientProfileShortSerializer

class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = ['id', 'date', 'start_time', 'end_time', 'is_booked']

class BulkAvailabilitySerializer(serializers.Serializer):
    dates = serializers.ListField(child=serializers.DateField())
    start_times = serializers.ListField(child=serializers.TimeField())
    duration_minutes = serializers.IntegerField(default=30)

class AppointmentSerializer(serializers.ModelSerializer):
    doctor_info = DoctorProfileShortSerializer(source='doctor', read_only=True)
    patient_info = PatientProfileShortSerializer(source='patient', read_only=True)
    
    class Meta:
        model = Appointment
        fields = ['id', 'doctor', 'doctor_info', 'patient', 'patient_info', 'date', 'time_slot', 'status', 'created_at', 'updated_at']
        read_only_fields = ['status', 'created_at', 'updated_at', 'patient']
