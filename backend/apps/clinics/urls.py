from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SpecializationViewSet
from apps.appointments.views import AvailabilityViewSet

router = DefaultRouter()
router.register(r'specialties', SpecializationViewSet, basename='specialty')
router.register(r'availability', AvailabilityViewSet, basename='availability')

urlpatterns = [
    path('', include(router.urls)),
]
