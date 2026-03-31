from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer
from ..models import CustomUser, PatientProfile

class UserSerializer(serializers.ModelSerializer):
    has_profile = serializers.SerializerMethodField()
    profile_id = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'has_profile', 'profile_id']

    def get_has_profile(self, obj):
        if obj.role == 'DOCTOR':
            return hasattr(obj, 'doctor_profile')
        if obj.role == 'PATIENT':
            return hasattr(obj, 'patient_profile')
        return True

    def get_profile_id(self, obj):
        if obj.role == 'DOCTOR' and hasattr(obj, 'doctor_profile'):
            return obj.doctor_profile.id
        if obj.role == 'PATIENT' and hasattr(obj, 'patient_profile'):
            return obj.patient_profile.id
        return None

class CustomRegisterSerializer(RegisterSerializer):
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=CustomUser.ROLE_CHOICES, default=CustomUser.PATIENT)

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        val_data = getattr(self, 'validated_data', {})
        data['first_name'] = val_data.get('first_name', '')
        data['last_name'] = val_data.get('last_name', '')
        data['phone_number'] = val_data.get('phone_number', '')
        data['role'] = val_data.get('role', CustomUser.PATIENT)
        return data

    def save(self, request):
        user = super().save(request)
        val_data = getattr(self, 'validated_data', {})
        user.first_name = val_data.get('first_name', user.first_name)
        user.last_name = val_data.get('last_name', user.last_name)
        user.role = val_data.get('role', user.role)
        user.save()
        
        phone = val_data.get('phone_number')
        if user.role == CustomUser.PATIENT and phone:
            patient_profile, _ = PatientProfile.objects.get_or_create(user=user)
            patient_profile.phone_number = phone
            patient_profile.save()
            
        return user

class ProfileUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    image = serializers.ImageField(required=False, allow_null=True)
