from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to edit it.
    Assumes the model instance has an `owner` attribute, or specific links.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Instance must have an attribute named `user`.
        # For Appointment: obj.patient.user or obj.doctor.user
        # For Availability: obj.doctor.user
        # For PatientProfile: obj.user
        # For DoctorProfile: obj.user

        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        if hasattr(obj, 'patient') and hasattr(obj.patient, 'user'):
            return obj.patient.user == request.user
            
        if hasattr(obj, 'doctor') and hasattr(obj.doctor, 'user'):
            return obj.doctor.user == request.user

        return False

class IsPatient(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'PATIENT'

class IsDoctor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'DOCTOR'

class IsAppointmentParticipant(permissions.BasePermission):
    """
    Allows access only to the patient or the doctor involved in the appointment.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
            
        # obj is an Appointment
        return obj.patient.user == request.user or obj.doctor.user == request.user
