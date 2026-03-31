from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from ..models import PatientProfile
from ..serializers import PatientProfileSerializer
from apps.appointments.permissions import IsOwnerOrReadOnly

class PatientProfileViewSet(viewsets.ModelViewSet):
    queryset = PatientProfile.objects.all()
    serializer_class = PatientProfileSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_staff or self.action in ['retrieve', 'update', 'partial_update', 'destroy'] or getattr(self, 'detail', False):
            return PatientProfile.objects.all()
        return PatientProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
