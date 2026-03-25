from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import DoctorProfile, PatientProfile
from apps.appointments.models import Availability
from apps.appointments.serializers import AvailabilitySerializer
from .serializers import DoctorProfileSerializer, PatientProfileSerializer, PatientProfileShortSerializer
from rest_framework.permissions import IsAuthenticated

class DoctorProfileViewSet(viewsets.ModelViewSet):
    queryset = DoctorProfile.objects.all()
    serializer_class = DoctorProfileSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        'specialization': ['exact'],
        'consultation_fee': ['gte', 'lte'],
    }

    @action(detail=True, methods=['get'])
    def availability(self, request, pk=None):
        doctor = self.get_object()
        # Only return unbooked slots
        availabilities = Availability.objects.filter(doctor=doctor, is_booked=False)
        serializer = AvailabilitySerializer(availabilities, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PatientProfileViewSet(viewsets.ModelViewSet):
    queryset = PatientProfile.objects.all()
    serializer_class = PatientProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return PatientProfile.objects.all()
        return PatientProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
