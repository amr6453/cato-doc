from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..serializers import ProfileUpdateSerializer

class ProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        serializer = ProfileUpdateSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            
            if 'first_name' in data:
                user.first_name = data['first_name']
            if 'last_name' in data:
                user.last_name = data['last_name']
            user.save()

            if user.role == 'DOCTOR' and hasattr(user, 'doctor_profile'):
                profile = user.doctor_profile
                if 'bio' in data:
                    profile.bio = data['bio']
                if 'image' in request.FILES:
                    profile.image = request.FILES['image']
                profile.save()
            
            elif user.role == 'PATIENT' and hasattr(user, 'patient_profile'):
                profile = user.patient_profile
                if 'phone_number' in data:
                    profile.phone_number = data['phone_number']
                if 'image' in request.FILES:
                    profile.image = request.FILES['image']
                profile.save()

            return Response({"success": "Profile updated successfully"})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
