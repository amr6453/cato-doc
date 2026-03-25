# 📑 CatoDoc: Project Requirements Document (PRD)

## 1. Project Overview
**CatoDoc** is a modern healthcare appointment booking system. It connects **Patients** with **Doctors**, allowing for seamless filtering by specialization, viewing real-time availability, and managing bookings efficiently.

---

## 2. Tech Stack (Current Implementation)

### 🔙 Backend
- **Framework:** Django + DRF (Django Rest Framework)
- **Auth:** Djoser + JWT (JSON Web Tokens)
- **Filtering:** `django-filter`
- **Documentation:** Swagger/Spectacular (`/api/schema/swagger-ui/`)

### 🎨 Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Shadcn UI
- **State Management:** React Hooks synced with URL SearchParams
- **Icons/UI:** Lucide React + Radix UI

---

## 3. Current Progress ✅

### A. Backend Architecture
- [x] **Database Models:**
  - `CustomUser`: Roles (Doctor, Patient, Admin).
  - `DoctorProfile`: Bio, Fee, Experience, Specialization (FK).
  - `PatientProfile`: DOB, Phone.
  - `Specialization`: Category names.
  - `Availability`: Time slots (`is_booked` boolean).
  - `Appointment`: Link between Patient, Doctor, and Time Slot.
- [x] **APIs:**
  - `/api/doctors/`: List of doctors with nested data.
  - `/api/doctors/?specialization=ID`: Functional filtering.
  - `/api/clinics/specialties/`: List of categories.
  - `/api/appointments/`: POST to create bookings.

### B. Frontend Implementation
- [x] **Dynamic Doctor Listing:** Fetches data from API.
- [x] **Reactive Filtering:** Sidebar filters update URL params and re-fetch.
- [x] **Doctor Details Page:** Dynamic routing (`/doctors/[id]`).
- [x] **Booking Calendar:** UI for selecting dates and slots.

---

## 4. Roadmap & Pending Requirements 🚀

### Phase 1: User Dashboards (High Priority)
- **Patient Dashboard** (`/dashboard/patient`):
  - List of booked appointments.
  - Status tracking (Pending -> Confirmed).
  - Cancellation logic (Toggling `is_booked=False` in Backend).
- **Doctor Dashboard** (`/dashboard/doctor`): [DONE]
  - List of all upcoming appointments (Active/Pending/Confirmed).
  - Practice statistics: Active Appointments & Total Revenue.
  - Manage appointment status (Mark as Complete).
  - Manage availability slots directly from UI. [DONE]
  - Automated cleanup of expired unbooked slots. [DONE]
  - Auto-cancellation of expired pending requests. [DONE]

### Phase 2: Authentication & Security
- **Profile Completion:** Redirect new users to fill profiles. [DONE]
- **Role-Based Access (RBAC):** Restrict booking to Patients and schedule viewing to Doctors. [DONE]
- **Protected Routes:** Frontend middleware for `/dashboard/**`. [DONE]
- **Date Integrity:** Local timezone handling for all calendar interactions. [DONE]

### Phase 3: Refinement
- **Image Handling:** Cloudinary or S3 for profile pictures.
- **Notifications:** UI alerts/toasts for successful bookings.

---

## 5. Known Paths & Endpoints

| Feature | Endpoint | Method |
| :--- | :--- | :--- |
| **Doctor List** | `/api/doctors/` | `GET` |
| **Filtered List** | `/api/doctors/?specialization=ID` | `GET` |
| **Specialties** | `/api/clinics/specialties/` | `GET` |
| **Book Appointment** | `/api/appointments/` | `POST` |
| **User Profile** | `/api/djoser/users/me/` | `GET` |

---

## 6. Development Guidelines 🤖

1.  **Sync First:** Always check `CatoDoc_Master_Sync.md` before writing code.
2.  **Naming Convention:**
    - **Backend:** `snake_case`
    - **Frontend:** `camelCase`
3.  **UI Consistency:** Use **Navy Blue** (`#001f3f`) for primary actions.
4.  **Error Handling:** Always implement **Loading Skeletons** and **Error Toast** notifications.