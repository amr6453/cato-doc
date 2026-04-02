'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { authApi, parseApiError } from '@/lib/api'
import type { User, LoginCredentials, RegisterData, ApiError, UserRole } from '@/lib/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: ApiError | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  hasRole: (roles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  // Check if user is authenticated
  const isAuthenticated = !!user

  // Clear any errors
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Check if user has one of the specified roles
  const hasRole = useCallback(
    (roles: UserRole[]): boolean => {
      if (!user) return false
      return roles.includes(user.role)
    },
    [user]
  )

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Just try to fetch the current user; the browser will send the httpOnly cookie
        const userData = await authApi.getCurrentUser()
        setUser(userData)
      } catch (err) {
        // Unauthenticated or session expired
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true)
    setError(null)

    try {
      await authApi.login(credentials)
      const userData = await authApi.getCurrentUser()
      setUser(userData)
    } catch (err) {
      const apiError = parseApiError(err)
      setError(apiError)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Register function
  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true)
    setError(null)

    try {
      await authApi.register(data)
      // Usually after registration, we might want to log in automatically 
      // or redirect to login. For now, let's keep it simple.
    } catch (err) {
      const apiError = parseApiError(err)
      setError(apiError)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Logout function
  const logout = useCallback(async () => {
    setIsLoading(true)

    try {
      await authApi.logout()
    } catch {
      // Continue with logout even if API call fails
    } finally {
      setUser(null)
      setIsLoading(false)
    }
  }, [])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    clearError,
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}
