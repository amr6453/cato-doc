from django.db import transaction
from datetime import datetime
from rest_framework import viewsets, mixins, serializers, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..models import Appointment, Availability
from ..serializers import AppointmentSerializer
from ..permissions import IsOwnerOrReadOnly, IsAppointmentParticipant

class AppointmentViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, IsAppointmentParticipant, IsOwnerOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        now = datetime.now()
        
        from django.db.models import Q
        expired_q = Q(status='PENDING') & (
            Q(date__lt=now.date()) | 
            Q(date=now.date(), time_slot__lt=now.time())
        )
        expired_appointments = Appointment.objects.filter(expired_q)
        
        if expired_appointments.exists():
            with transaction.atomic():
                for appt in expired_appointments:
                    appt.status = 'CANCELLED'
                    appt.save()
                    Availability.objects.filter(
                        doctor=appt.doctor,
                        date=appt.date,
                        start_time=appt.time_slot
                    ).update(is_booked=False)
        
        if self.action in ['retrieve', 'update', 'partial_update', 'destroy', 'cancel', 'confirm', 'complete'] or user.is_staff:
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

    @action(detail=True, methods=['patch'], url_path='complete')
    def complete(self, request, pk=None):
        appointment = self.get_object()
        
        if appointment.status == 'COMPLETED':
            return Response({"detail": "Appointment is already completed."}, status=status.HTTP_400_BAD_REQUEST)
        
        if appointment.status == 'CANCELLED':
            return Response({"detail": "Cannot complete a cancelled appointment."}, status=status.HTTP_400_BAD_REQUEST)
            
        appointment.status = 'COMPLETED'
        appointment.save()
            
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], url_path='confirm')
    def confirm(self, request, pk=None):
        appointment = self.get_object()
        
        if appointment.status != 'PENDING':
            return Response({"detail": f"Cannot confirm appointment with status {appointment.status}."}, status=status.HTTP_400_BAD_REQUEST)
            
        appointment.status = 'CONFIRMED'
        appointment.save()
            
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], url_path='cancel')
    def cancel(self, request, pk=None):
        appointment = self.get_object()
        
        if appointment.status == 'CANCELLED':
            return Response({"detail": "Appointment is already cancelled."}, status=status.HTTP_400_BAD_REQUEST)
            
        with transaction.atomic():
            appointment.status = 'CANCELLED'
            appointment.save()
            
            slot = Availability.objects.filter(
                doctor=appointment.doctor,
                date=appointment.date,
                start_time=appointment.time_slot
            ).first()
            
            if slot:
                slot.is_booked = False
                slot.save()
                
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    def perform_create(self, serializer):
        try:
            patient_profile = self.request.user.patient_profile
        except AttributeError:
            raise serializers.ValidationError("Only users with a patient profile can book appointments.")
        
        doctor = serializer.validated_data['doctor']
        date = serializer.validated_data['date']
        time_slot = serializer.validated_data['time_slot']
        
        now = datetime.now()
        if date < now.date() or (date == now.date() and time_slot <= now.time()):
            raise serializers.ValidationError({"time_slot": "Cannot book an appointment in the past."})
        
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

        if new_status == 'CANCELLED' and old_status != 'CANCELLED':
            with transaction.atomic():
                slot = Availability.objects.filter(
                    doctor=instance.doctor,
                    date=instance.date,
                    start_time=instance.time_slot
                ).first()
                
                if slot:
                    slot.is_booked = False
                    slot.save()

        serializer.save()
