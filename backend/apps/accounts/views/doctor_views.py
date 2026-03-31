from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from datetime import datetime
from django.db.models import Q

from ..models import DoctorProfile
from ..serializers import DoctorProfileSerializer
from apps.appointments.models import Availability
from apps.appointments.serializers import AvailabilitySerializer
from apps.appointments.permissions import IsOwnerOrReadOnly

class DoctorProfileViewSet(viewsets.ModelViewSet):
    queryset = DoctorProfile.objects.all()
    serializer_class = DoctorProfileSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        'specialization': ['exact'],
        'consultation_fee': ['gte', 'lte'],
    }

    def get_queryset(self):
        # Doctors are public for listing, but we keep the detail logic for consistency
        return DoctorProfile.objects.all()

    @action(detail=True, methods=['get'])
    def availability(self, request, pk=None):
        doctor = self.get_object()
        now = datetime.now()
        
        # Only return unbooked future slots
        availabilities = Availability.objects.filter(
            doctor=doctor, 
            is_booked=False
        ).filter(
            Q(date__gt=now.date()) | 
            Q(date=now.date(), start_time__gt=now.time())
        )
        serializer = AvailabilitySerializer(availabilities, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
