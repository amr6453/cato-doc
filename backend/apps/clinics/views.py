from rest_framework import viewsets
from .models import Specialization
from .serializers import SpecializationSerializer

class SpecializationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Specialization.objects.all()
    serializer_class = SpecializationSerializer
