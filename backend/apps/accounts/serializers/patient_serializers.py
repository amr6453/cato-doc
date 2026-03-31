from rest_framework import serializers
from ..models import PatientProfile
from .auth_serializers import UserSerializer

class PatientProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = PatientProfile
        fields = '__all__'

class PatientProfileShortSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = PatientProfile
        fields = ['id', 'user_name']
