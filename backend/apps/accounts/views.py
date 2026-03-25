from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import DoctorProfile
from apps.appointments.models import Availability
from apps.appointments.serializers import AvailabilitySerializer
from .serializers import DoctorProfileSerializer

class DoctorProfileViewSet(viewsets.ReadOnlyModelViewSet):
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
