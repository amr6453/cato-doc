from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DoctorProfileViewSet, PatientProfileViewSet, ProfileUpdateView

router = DefaultRouter()
router.register(r'doctors', DoctorProfileViewSet, basename='doctor')
router.register(r'patients', PatientProfileViewSet, basename='patient')

urlpatterns = [
    path('profile/me/', ProfileUpdateView.as_view(), name='profile-update'),
    path('', include(router.urls)),
]
