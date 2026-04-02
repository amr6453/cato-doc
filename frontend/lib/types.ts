// User roles for role-based access control
export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'GUEST'

// Base User interface matching CustomUser in Django
export interface User {
  id: number
  username: string
  email: string
  role: UserRole
  first_name?: string
  last_name?: string
  image?: string
  has_profile: boolean
  profile_id?: number
}

export interface Specialization {
  id: number
  name: string
}

export interface DoctorProfile {
  id: number
  user: User
  specialization: Specialization
  bio: string
  consultation_fee: string | number
  years_of_experience: number
  clinic_address: string
  image?: string 
  rating?: number 
}

export interface PatientProfile {
  id: number
  user: User
  date_of_birth?: string
  phone_number?: string
  image?: string
  medical_history?: string
}

// Data for profile updates (Partial)
export interface ProfileUpdateData {
  first_name?: string
  last_name?: string
  bio?: string
  phone_number?: string
  image?: File | null
}

export interface Availability {
  id: number
  doctor: number | DoctorProfile
  date: string
  start_time: string
  end_time: string
  is_booked: boolean
}

export interface Appointment {
  id: number
  doctor: number
  doctor_info?: {
    user_name: string
    specialization_name: string
    clinic_address: string
    consultation_fee: string | number
  }
  patient: number
  patient_info?: {
    user_name: string
  }
  date: string
  time_slot: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
}

// Auth response from Django backend (JWT)
export interface AuthResponse {
  user: User
  access: string
  refresh: string
}

// Login credentials
export interface LoginCredentials {
  username: string // Backend uses username
  password: string
}

// Registration data
export interface RegisterData {
  username: string
  email: string
  password: string
  password_confirm?: string
  first_name?: string
  last_name?: string
  role: 'PATIENT' | 'DOCTOR'
}


// API error response
export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  status?: number
}

// Navigation item type for role-based navbar
export interface NavItem {
  label: string
  href: string
  roles: UserRole[]
  icon?: string
}
