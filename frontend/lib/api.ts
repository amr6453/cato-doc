import axios, { AxiosError, type AxiosInstance } from 'axios'
import type { AuthResponse, LoginCredentials, RegisterData, User, ApiError, DoctorProfile, PatientProfile, Specialization, Appointment, Availability, AppNotification } from './types'

// API base URL - Django backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookie-based auth
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // No need to manually add Bearer token as browsers send httpOnly cookies automatically
    // with { withCredentials: true } which is already set in the instance config.
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean }
    
    // Handle 401 Unauthorized - try to refresh token via cookie
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login/') || 
                          originalRequest?.url?.includes('/auth/token/refresh/') ||
                          originalRequest?.url?.includes('/registration/')

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
      originalRequest._retry = true
      
      try {
        // Calling refresh endpoint with credentials will update the cookies
        await axios.post(
          `${API_BASE_URL}/auth/token/refresh/`,
          {},
          { withCredentials: true }
        )
        
        if (originalRequest) {
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed - cookies are likely invalid
        // Only redirect if not already on an auth page to prevent refresh loops
        if (typeof window !== 'undefined' && 
            !window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/register')) {
          window.location.href = '/login'
        }
      }
    }
    
    return Promise.reject(error)
  }
)

// Parse API error
export function parseApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as any
    
    // If it's a validation error object, join the messages
    let message = data?.message || data?.detail || error.message || 'An error occurred'
    
    if (data && typeof data === 'object' && !data.message && !data.detail) {
      // Extract first error message from values
      const firstError = Object.values(data)[0]
      if (Array.isArray(firstError)) {
        message = firstError[0]
      } else if (typeof firstError === 'string') {
        message = firstError
      }
    }
    
    return {
      message,
      errors: data?.errors || data,
      status: error.response?.status,
    }
  }
  return { message: 'An unexpected error occurred' }
}

// Auth API endpoints
export const authApi = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // dj-rest-auth login endpoint sets httpOnly cookies
    const response = await api.post<AuthResponse>('/auth/login/', credentials)
    
    // Tokens are now in cookies, but we might still get user info in the body
    return response.data
  },

  // Register new user
  register: async (data: RegisterData): Promise<any> => {
    // dj-rest-auth registration expects password1 and password2
    const payload = {
      ...data,
      password1: data.password,
      password2: data.password_confirm,
    }
    const response = await api.post<any>('/registration/', payload)
    return response.data
  },


  // Logout user
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout/')
    } finally {
      // Clear tokens regardless of API response
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/user/')
    return response.data
  },

  // Refresh access token
  refreshToken: async (): Promise<any> => {
    const response = await api.post<any>('/auth/token/refresh/', {})
    return response.data
  },
}

// User API endpoints for self-management
export const userApi = {
  // Update current user profile (using FormData for potential image upload)
  updateMe: async (data: any): Promise<{ success: string }> => {
    let payload: any = data
    
    // If it's not already FormData and we have an image, convert it
    if (!(data instanceof FormData) && (data.image || data.first_name || data.last_name || data.bio || data.phone_number)) {
      payload = new FormData()
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          payload.append(key, data[key])
        }
      })
    }
    
    const config = payload instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {}
      
    const response = await api.patch<{ success: string }>('/profile/me/', payload, config)
    return response.data
  },
}

// Doctor API endpoints
export const doctorApi = {
  // Get all doctors
  getDoctors: async (params?: any): Promise<DoctorProfile[]> => {
    const response = await api.get<DoctorProfile[]>('/doctors/', { params })
    return response.data
  },

  // Get a single doctor
  getDoctorById: async (id: string | number): Promise<DoctorProfile> => {
    const response = await api.get<DoctorProfile>(`/doctors/${id}/`)
    return response.data
  },

  // Get availability for a doctor
  getAvailability: async (id: string | number): Promise<Availability[]> => {
    const response = await api.get<Availability[]>(`/doctors/${id}/availability/`)
    return response.data
  },

  // Create doctor profile
  createProfile: async (data: any): Promise<DoctorProfile> => {
    const response = await api.post<DoctorProfile>('/doctors/', data)
    return response.data
  },

  // Update doctor profile (self)
  updateProfile: async (id: number, data: any): Promise<DoctorProfile> => {
    const response = await api.patch<DoctorProfile>(`/doctors/${id}/`, data)
    return response.data
  },
}

// Patient API endpoints
export const patientApi = {
  // Create patient profile
  createProfile: async (data: any): Promise<PatientProfile> => {
    const response = await api.post<PatientProfile>('/patients/', data)
    return response.data
  },

  // Get patient profile (self)
  getProfile: async (): Promise<PatientProfile[]> => {
    const response = await api.get<PatientProfile[]>('/patients/')
    return response.data
  },

  // Update patient profile
  updateProfile: async (id: number, data: any): Promise<PatientProfile> => {
    const response = await api.patch<PatientProfile>(`/patients/${id}/`, data)
    return response.data
  },
}

// Clinic API endpoints
export const clinicsApi = {
  // Get all specializations
  getSpecialties: async (): Promise<Specialization[]> => {
    const response = await api.get<Specialization[]>('/clinics/specialties/')
    return response.data
  },
}

// Appointment API endpoints
export const appointmentsApi = {
  // Get appointments for the current user
  getMyAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>('/appointments/my-appointments/')
    return response.data
  },

  // Create a new appointment
  createAppointment: async (data: { doctor: number; date: string; time_slot: string }): Promise<Appointment> => {
    const response = await api.post<Appointment>('/appointments/', data)
    return response.data
  },

  // Cancel an appointment
  cancelAppointment: async (id: number): Promise<Appointment> => {
    const response = await api.patch<Appointment>(`/appointments/${id}/cancel/`)
    return response.data
  },

  // Complete an appointment
  completeAppointment: async (id: number): Promise<Appointment> => {
    const response = await api.patch<Appointment>(`/appointments/${id}/complete/`)
    return response.data
  },

  // Confirm an appointment
  confirmAppointment: async (id: number): Promise<Appointment> => {
    const response = await api.patch<Appointment>(`/appointments/${id}/confirm/`)
    return response.data
  },

  // Availability Management
  getAvailabilities: async (): Promise<Availability[]> => {
    const response = await api.get<Availability[]>('/clinics/availability/')
    return response.data
  },

  addAvailability: async (data: Partial<Availability>): Promise<Availability> => {
    const response = await api.post<Availability>('/clinics/availability/', data)
    return response.data
  },

  deleteAvailability: async (id: number): Promise<void> => {
    await api.delete(`/clinics/availability/${id}/`)
  },

  bulkCreateAvailabilities: async (data: { dates: string[], start_times: string[], duration_minutes: number }): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/clinics/availability/bulk-create/', data)
    return response.data
  },

  // Get available slots for a specific doctor (Public)
  getDoctorAvailability: async (doctorId: number, date: string): Promise<Availability[]> => {
    const response = await api.get<Availability[]>(`/doctors/${doctorId}/availability/`, {
      params: { date }
    })
    return response.data
  }
}

// Notifications API
export const notificationsApi = {
  // Get all notifications for current user
  getNotifications: async (): Promise<AppNotification[]> => {
    const response = await api.get<AppNotification[]>('/notifications/')
    return response.data
  },

  // Mark a single notification as read
  markAsRead: async (id: number): Promise<void> => {
    await api.patch(`/notifications/${id}/`, { is_read: true })
  },

  // Mark all as read
  markAllAsRead: async (): Promise<void> => {
    await api.post('/notifications/mark-all-read/')
  }
}

export default api

