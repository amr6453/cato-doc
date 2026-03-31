# SESSION LOG - 2026-03-31
- Implemented `/settings` page and modular `ProfileForm` for real-time profile management.
- Synchronized TypeScript interfaces with Backend's modular structure (`User`, `DoctorProfile`, `PatientProfile`).
- Added `userApi.updateMe` supporting `FormData` for image uploads via `/api/profile/me/`.

- Modularized the `accounts` and `appointments` apps by splitting monolith `views.py` and `serializers.py` into task-specific sub-modules.
- Configured Cloudinary integration for production-ready profile image hosting, including `.env` setup and package installation.
- Updated all API routes and imports to maintain full system synchronization with the new modular structure.

## What's Changed
- Created `accounts/views/`, `accounts/serializers/`, `appointments/views/`, and `appointments/serializers/` directories with task-specific files.
- Installed `cloudinary` and `django-cloudinary-storage` and verified `settings.py` compatibility.
- Created a `.env` template in the backend root for Cloudinary credentials.
- Updated `accounts/urls.py` and `appointments/urls.py` for modular routing.

## What's Broken
- None. (Verified by checking internal imports and endpoint registrations).

- Implemented availability deletion logic in `AvailabilityViewSet` to allow only unbooked slots to be deleted by their owners.
- Moved and renamed the availability endpoint to `/api/clinics/availability/` to follow the requested group-based URL structure.
- Enforced role-based and ownership permissions using `IsDoctor` and `IsOwnerOrReadOnly` throughout the appointments app.

## What's Changed
- Modified `AvailabilityViewSet.perform_destroy` to return a 400 error when attempting to delete booked slots.
- Updated `backend/apps/clinics/urls.py` and `backend/apps/appointments/urls.py` for correct endpoint routing.
- Verified system-wide permission consistency for availability management.

## What's Broken
- None. (Verified endpoint routing and permission logic).

## What's Next
- Finalize other profile management settings if any.
- Review and cleanup old monolithic files if no longer needed.

# SESSION LOG - 2026-03-30
- Fixed logic to prevent doctors' past availabilities from showing up and blocked patients from booking past appointments.
- Fixed a backend server crash by adding missing `CustomUser`, `DoctorProfile`, and `PatientProfile` model imports to `accounts/serializers.py`.
- Fixed VS Code Python Environment Tools (PET) crashes caused by Windows Application Control blocking Chocolatey python3.14.exe shim.
- Disabled native Python locator in VS Code settings and set explicit workspace interpreter path.
- Nothing is broken; reload the VS Code window to apply changes.
# SESSION LOG - 2026-03-29
Implemented strict object-level permissions and security audit script.
Enforced 403 Forbidden for unauthorized access to appointments and profiles.
Updated frontend with conditional rendering for ownership-based UI protection.

## What's Changed
- Created `IsOwnerOrReadOnly` and role-based permission classes in backend.
- Implemented `security_audit.py` to verify 403 responses for "hacker" scenarios.
- Updated `UserSerializer` and Frontend UI to prevent unauthorized actions and button visibility.

## What's Broken
- None. (Verified by audit script).

## What's Next
- Refinement phase: Cloudinary for images and specialized notifications.
- Deployment preparation.
