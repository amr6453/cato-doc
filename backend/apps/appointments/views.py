from django.db import transaction
from datetime import datetime, timedelta
from rest_framework import viewsets, mixins, serializers, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Appointment, Availability
from .serializers import AppointmentSerializer, AvailabilitySerializer, BulkAvailabilitySerializer

class IsDoctor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'DOCTOR'

class AvailabilityViewSet(viewsets.ModelViewSet):
    queryset = Availability.objects.all()
    serializer_class = AvailabilitySerializer
    permission_classes = [IsAuthenticated, IsDoctor]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'doctor_profile'):
            return Availability.objects.filter(doctor=user.doctor_profile)
        return Availability.objects.none()

    def perform_create(self, serializer):
        serializer.save(doctor=self.request.user.doctor_profile)

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
                    # Basic overlap check: exact same start time
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

class AppointmentViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Appointment.objects.all()
        
        if hasattr(user, 'patient_profile'):
            return Appointment.objects.filter(patient=user.patient_profile)
        elif hasattr(user, 'doctor_profile'):
            return Appointment.objects.filter(doctor=user.doctor_profile)
        
        return Appointment.objects.none()

    @action(detail=False, methods=['get'], url_path='my-appointments')
    def my_appointments(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        try:
            patient_profile = self.request.user.patient_profile
        except AttributeError:
            raise serializers.ValidationError("Only users with a patient profile can book appointments.")
        
        doctor = serializer.validated_data['doctor']
        date = serializer.validated_data['date']
        time_slot = serializer.validated_data['time_slot']
        
        with transaction.atomic():
            slot = Availability.objects.select_for_update().filter(
                doctor=doctor, 
                date=date, 
                start_time=time_slot, 
                is_booked=False
            ).first()
            
            if not slot:
                raise serializers.ValidationError("This time slot is no longer available.")
                
            slot.is_booked = True
            slot.save()
            
            serializer.save(patient=patient_profile)

    def perform_update(self, serializer):
        instance = self.get_object()
        old_status = instance.status
        new_status = serializer.validated_data.get('status')

        # Cancellation logic
        if new_status == 'CANCELLED' and old_status != 'CANCELLED':
            # Try to find the corresponding availability slot and free it
            slot = Availability.objects.filter(
                doctor=instance.doctor,
                date=instance.date,
                start_time=instance.time_slot
            ).first()
            
            if slot:
                slot.is_booked = False
                slot.save()

        serializer.save()
