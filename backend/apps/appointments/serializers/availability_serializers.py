from rest_framework import serializers
from ..models import Availability

class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = ['id', 'date', 'start_time', 'end_time', 'is_booked']

class BulkAvailabilitySerializer(serializers.Serializer):
    dates = serializers.ListField(child=serializers.DateField())
    start_times = serializers.ListField(child=serializers.TimeField())
    duration_minutes = serializers.IntegerField(default=30)
