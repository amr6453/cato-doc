from rest_framework import serializers
from ..models import Appointment
from apps.accounts.serializers import DoctorProfileShortSerializer, PatientProfileShortSerializer

class AppointmentSerializer(serializers.ModelSerializer):
    doctor_info = DoctorProfileShortSerializer(source='doctor', read_only=True)
    patient_info = PatientProfileShortSerializer(source='patient', read_only=True)
    
    class Meta:
        model = Appointment
        fields = ['id', 'doctor', 'doctor_info', 'patient', 'patient_info', 'date', 'time_slot', 'status', 'created_at', 'updated_at']
        read_only_fields = ['status', 'created_at', 'updated_at', 'patient']
