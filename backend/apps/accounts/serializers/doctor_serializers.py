from rest_framework import serializers
from ..models import DoctorProfile
from .auth_serializers import UserSerializer
from apps.clinics.serializers import SpecializationSerializer

class DoctorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    specialization = SpecializationSerializer(read_only=True)
    
    class Meta:
        model = DoctorProfile
        fields = '__all__'

class DoctorProfileShortSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    specialization_name = serializers.CharField(source='specialization.name', read_only=True)
    
    class Meta:
        model = DoctorProfile
        fields = ['id', 'user_name', 'specialization_name', 'clinic_address', 'consultation_fee']
