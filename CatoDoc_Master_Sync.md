# 🔄 CatoDoc Project Master Sync File

## 1. System Overview
- **Project Name:** CatoDoc
- **Frontend:** Next.js 14 (App Router) + Tailwind + Shadcn UI
- **Backend:** Django DRF + Djoser + JWT (httpOnly Cookies)
- **Primary Color:** Navy Blue (#001f3f) | Secondary: Pure White (#ffffff)

## 2. Shared API Contracts (The Bridge) 🌉
> This section is for Backend to tell Frontend what endpoints are ready.
- **Base URL:** `http://localhost:8000/api`
- **Auth Status:** [Implemented - JWT]
- **Endpoints Table:**
| Endpoint | Method | Payload | Response | Status |
| :--- | :--- | :--- | :--- | :--- |
| `/api/auth/login/` | POST | `{username, password}` | `{user, ...}` + Cookies | [Ready] |
| `/api/auth/logout/` | POST | None | Success Msg | [Ready] |
| `/api/auth/token/refresh/` | POST | None | Cookies updated | [Ready] |
| `/api/auth/user/` | GET | None | `{id, username, email, ...}` | [Ready] |
| `/api/registration/` | POST | `{username, email, password, ...}` | `{id, username, email}` | [Ready] |
| `/api/clinics/specialties/` | GET | None | `[{id, name}]` | [Ready] |
| `/api/doctors/` | GET | Query Params | `[{id, user, specialization, ...}]` | [Ready] |
| `/api/doctors/{id}/availability/` | GET | None | `[{id, date, start_time, ...}]` | [DONE] |
| `/api/appointments/my-appointments/` | GET | None | `[{id, doctor, patient, date, status}]` | [DONE] |
| `/api/appointments/` | POST | `{doctor, date, time_slot}` | `{id, doctor, patient, date, status}` | [DONE] |
| `/api/appointments/{id}/` | PATCH | `{status}` | `{id, doctor, patient, date, status}` | [DONE] |
| `/api/schema/swagger-ui/` | GET | None | HTML (Documentation) | [Ready] |

## 3. Data Schema [Ready] 🗄️

### **Accounts App**
- **CustomUser**: (Inherits AbstractUser)
    - `email`: (Unique) - `__str__`: `username (role)`
    - `username`: (Unique)
    - `role`: `Choices(DOCTOR, PATIENT, ADMIN)`
- **PatientProfile**: (One-to-One with CustomUser)
    - `date_of_birth`: Date
    - `phone_number`: String
- **DoctorProfile**: (One-to-One with CustomUser)
    - `specialization`: ForeignKey(Specialization)
    - `bio`: TextField
    - `consultation_fee`: Decimal
    - `years_of_experience`: Integer
    - `clinic_address`: TextField

### **Clinics App**
- **Specialization**:
    - `name`: String (e.g., Dentist, Cardiologist) - `__str__`: `name`

### **Appointments App**
- **Availability**:
    - `doctor`: ForeignKey(DoctorProfile)
    - `date`: Date
    - `start_time`: Time
    - `end_time`: Time
    - `is_booked`: Boolean
- **Appointment**:
    - `doctor`: ForeignKey(DoctorProfile)
    - `patient`: ForeignKey(PatientProfile)
    - `date`: Date
    - `time_slot`: Time
    - `status`: `Choices(Pending, Confirmed, Completed, Cancelled)`

## 4. Frontend Routes 🛣️
- `/login`: Login page with authentication form.
- `/register`: Registration page for new users.
- `/doctors`: Doctors Listing with filters and grid view.
- `/doctors/[id]`: Detailed Doctor profile and booking calendar.
- `/dashboard/patient`: Patient Dashboard (My Appointments) | [DONE]
- `/dashboard/doctor`: Doctor dashboard with daily schedule.
- `/about`: About us page.
- `/contact`: Contact us page with form.

## 4. Latest Changes Tracking 📝
- **[2026-03-25] BACKEND:** Fixed VS Code "Could not find import" error by creating `.vscode/settings.json` and pointing Pylance to the `backend\env` virtual environment. [DONE]
- **[2026-03-19] AUTH:** Transitioned to **httpOnly Cookies** for JWT storage. Configured `dj-rest-auth` and `Axios` (`withCredentials: true`) to handle secure session persistence without `localStorage`. [Ready]
- **[2026-03-19] AUTH:** Consolidated JWT authentication on Djoser endpoints (Previous). [Replaced by Cookie Auth]
- **[2026-03-19] BACKEND:** Implemented **Complete Booking Flow** logic. Added `/api/doctors/{id}/availability/` endpoint and updated `AppointmentViewSet` to automatically mark availability slots as booked upon appointment creation. [Ready]
- **[2026-03-19] BACKEND:** Implemented `my-appointments` endpoint with role-based filtering. [DONE]
- **[2026-03-19] BACKEND:** Implemented Appointment cancellation logic (frees up `Availability` slot). [DONE]
- **[2026-03-19] FRONTEND:** Implemented `appointmentsApi` with cancellation support. [DONE]
- **[2026-03-19] FRONTEND:** Implemented `/dashboard/patient` with real-time data and empty state. [DONE]
- **[2026-03-19] FRONTEND:** Updated `/doctors/[id]` page to include an authentication guard and live availability booking. [Ready]
- **[2026-03-19] FRONTEND:** Fixed synchronization issue in `DoctorsPage` by renaming the query parameter `specialty` to `specialization` and implementing URL-based reactivity for filters. [Ready]
- **[2026-03-19] BACKEND:** Installed `django-filter` and updated `DoctorProfileViewSet` to support filtering by `specialization`. [Ready]
- **[2026-03-19] BACKEND:** Created/verified `AppointmentViewSet` for list and creation restricted to authenticated users. Added `IsAuthenticatedOrReadOnly` as default DRF permission. [Ready]
- **[2026-03-19] BACKEND:** Completed configuring serializers, views (`ModelViewSet`), and routers in `urls.py` for `accounts`, `clinics`, and `appointments`. [Ready]
- **[2026-03-19] BACKEND:** Fixed CORS `Access-Control-Allow-Credentials` issue to allow authenticated requests from the frontend. [Ready]
- **[2026-03-19] BACKEND:** Implemented `SpecializationViewSet` and `DoctorProfileViewSet` with corresponding serializers and URLs. [Ready]
- **[2026-03-19] FRONTEND:** Refactored `/doctors` and `/doctors/[id]` pages to be 'API-Ready' with dynamic data fetching, loading skeletons, and empty states. [Ready]
- **[2026-03-19] FRONTEND:** Implemented fallback image logic for doctors without profile pictures in `DoctorCard`. [Ready]
- **[2026-03-19] FRONTEND:** Created TypeScript interfaces for `DoctorProfile`, `Specialization`, `Appointment`, etc., and updated `api.ts`. [Ready]
- **[2026-03-19] BACKEND:** Implemented Custom User model, DoctorProfile, PatientProfile, Specialization, Availability, and Appointment models. [Ready]
- **[2026-03-19] BACKEND:** Configured `AUTH_USER_MODEL` and successfully ran migrations after a clean database reset. [Ready]
- **[2026-03-19] FRONTEND:** Implemented all core routes to eliminate 404 errors.
- **[2026-03-19] FRONTEND:** Added interactive booking calendar and mobile-responsive sidebar filters.
- **[2026-03-19] FRONTEND:** Populated UI with mock data for testing and demonstration.
- **[2026-03-19] FRONTEND:** UI Scaffolded by v0. Added Login/Register forms.
- **[2026-03-19] FRONTEND:** Configured `api.ts` with `withCredentials: true`.
- **[2026-03-19] BACKEND:** Configured DRF, JWT, Djoser, and Spectacular for API documentation. 
- **[2026-03-19] BACKEND:** Installed all dependencies and verified core endpoints (Auth, Profile, Schema).
- **[2026-03-19] BACKEND:** Added `api1.http` for easy API testing and demonstration.

## 5. Pending Items ⏳
- **[Frontend]** Connect Doctor Listing and Details to real Django API. [DONE]
- **[Frontend]** Implement real booking logic and state management. [DONE]
- **[Frontend]** Integrate Patient and Doctor Dashboards with backend and real data.
- **[Backend]** Implement Endpoints for Doctors, Appointments, and User Profiles. [DONE]
- **[Backend]** Ensure authentication flows correctly with custom user types.


## 6. Pending Conflicts/Issues ⚠️
- Ensure the `AuthContext` in Next.js waits for Django's CSRF token if needed.
- Verify consistent theme application across all newly created pages.