from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SpecializationViewSet

router = DefaultRouter()
router.register(r'specialties', SpecializationViewSet, basename='specialty')

urlpatterns = [
    path('', include(router.urls)),
]
