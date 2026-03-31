from django.db import transaction
from datetime import datetime, timedelta
from rest_framework import viewsets, serializers, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import Availability
from ..serializers import AvailabilitySerializer, BulkAvailabilitySerializer
from ..permissions import IsOwnerOrReadOnly, IsDoctor

class AvailabilityViewSet(viewsets.ModelViewSet):
    queryset = Availability.objects.all()
    serializer_class = AvailabilitySerializer
    permission_classes = [IsAuthenticated, IsDoctor, IsOwnerOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        
        if self.action in ['retrieve', 'update', 'partial_update', 'destroy'] or getattr(self, 'detail', False):
            return Availability.objects.all()

        if hasattr(user, 'doctor_profile'):
            now = datetime.now()
            from django.db.models import Q
            return Availability.objects.filter(doctor=user.doctor_profile).filter(
                Q(is_booked=True) | Q(date__gt=now.date()) | 
                Q(date=now.date(), start_time__gt=now.time())
            )
        return Availability.objects.none()

    def perform_create(self, serializer):
        serializer.save(doctor=self.request.user.doctor_profile)

    def perform_destroy(self, instance):
        if instance.is_booked:
            # Block deletion if already booked
            raise serializers.ValidationError({"detail": "Cannot delete a booked availability slot. You must cancel the appointment first to free up the slot."})
        instance.delete()

    @action(detail=False, methods=['post'], url_path='bulk-create')
    def bulk_create(self, request):
        serializer = BulkAvailabilitySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        dates = serializer.validated_data['dates']
        start_times = serializer.validated_data['start_times']
        duration = serializer.validated_data['duration_minutes']
        
        doctor_profile = request.user.doctor_profile
        new_slots = []
        
        with transaction.atomic():
            for date in dates:
                for start_time in start_times:
                    if Availability.objects.filter(doctor=doctor_profile, date=date, start_time=start_time).exists():
                        continue
                        
                    end_dt = datetime.combine(date, start_time) + timedelta(minutes=duration)
                    
                    new_slots.append(Availability(
                        doctor=doctor_profile,
                        date=date,
                        start_time=start_time,
                        end_time=end_dt.time(),
                        is_booked=False
                    ))
            
            Availability.objects.bulk_create(new_slots)
            
        return Response({"message": f"Successfully created {len(new_slots)} slots."}, status=status.HTTP_201_CREATED)
