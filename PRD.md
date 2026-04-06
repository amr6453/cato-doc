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
- **Real-time:** Django Channels + Redis (Daphne ASGI)

### 🎨 Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Shadcn UI
- **State Management:** React Hooks synced with URL SearchParams
- **Icons/UI:** Lucide React + Radix UI

---

## 3. Completed Progress ✅

### A. Backend Architecture [DONE]
- [x] **Database Models:** Cases for Roles, Profiles, Appointments, etc.
- [x] **APIs:** Optimized endpoints for filtering, listing, and booking.
- [x] **Security:** Strict Object-Level Permissions and RBAC. [DONE]
- [x] **Real-time:** Notification system using WebSockets. [DONE]

### B. Frontend Implementation [DONE]
- [x] **Dynamic Doctor Listing & Filtering:** Reactivity via URL params.
- [x] **User Dashboards:** Patient and Doctor specific views with statistics.
- [x] **Profile Management:** Standalone setting page with Cloudinary upload support. [DONE]

---

## 4. Roadmap Status 🚀

### Phase 1: User Dashboards [DONE]
- Refined Dashboard experience for both User roles.

### Phase 2: Authentication & Security [DONE]
- RBAC and Protected Routes.

### Phase 3: Refinement [DONE]
- **Image Handling:** Cloudinary integration for profile pictures. [DONE]
- **Notifications:** Real-time WebSocket alerts for booking events. [DONE]

---

## 5. Known Paths & Endpoints

| Feature | Endpoint | Method |
| :--- | :--- | :--- |
| **Doctor List** | `/api/doctors/` | `GET` |
| **Filtered List** | `/api/doctors/?specialization=ID` | `GET` |
| **Book Appointment** | `/api/appointments/` | `POST` |
| **User Profile** | `/api/auth/user/` | `GET` |
| **WS Alerts** | `ws/notifications/` | `WS` |

---

## 6. Project Health 🏆
- **Overall Status:** COMPLETED
- **System Stability:** Verified with security audits and migration checks.
- **Documentation:** CatoDoc_Master_Sync.md (Updated 2026-04-06).