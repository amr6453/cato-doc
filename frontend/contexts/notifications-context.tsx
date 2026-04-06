'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { notificationsApi } from '@/lib/api'
import type { AppNotification } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

interface NotificationsContextType {
  notifications: AppNotification[]
  unreadCount: number
  markAsRead: (id: number) => Promise<void>
  markAllAsRead: () => Promise<void>
  refreshNotifications: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const socketRef = useRef<WebSocket | null>(null)

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const data = await notificationsApi.getNotifications()
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.is_read).length)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // WebSocket connection logic (Singleton)
  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.close()
        socketRef.current = null
      }
      return
    }

    const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'
    const socketUrl = `${wsBaseUrl}/ws/notifications/`

    const connect = () => {
      if (socketRef.current?.readyState === WebSocket.OPEN) return

      const socket = new WebSocket(socketUrl)
      socketRef.current = socket

      socket.onopen = () => {
        console.log('🔔 Notifications WebSocket Connected')
      }

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        
        if (data.type === 'notification_message') {
          const newNotification: AppNotification = {
            id: data.notification_id || Date.now(),
            message: data.message,
            type: data.notification_type || 'info',
            is_read: false,
            created_at: data.created_at || new Date().toISOString()
          }

          setNotifications(prev => [newNotification, ...prev])
          setUnreadCount(prev => prev + 1)
          
          toast({
            title: "New Alert",
            description: data.message,
            variant: "default",
            className: "bg-blue-600 text-white border-none font-bold"
          })
        }
      }

      socket.onclose = (event) => {
        console.log('🔕 Notifications WebSocket Disconnected', event.reason)
        if (!event.wasClean && isAuthenticated) {
          setTimeout(connect, 3000)
        }
      }

      socket.onerror = (error) => {
        console.error('❌ Notifications WebSocket Error:', error)
        socket.close()
      }
    }

    connect()

    return () => {
      if (socketRef.current) {
        socketRef.current.close()
        socketRef.current = null
      }
    }
  }, [isAuthenticated, user, toast])

  const markAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  return (
    <NotificationsContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      refreshNotifications: fetchNotifications
    }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotificationsContext() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error('useNotificationsContext must be used within a NotificationsProvider')
  }
  return context
}
