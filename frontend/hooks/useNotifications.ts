'use client'

import { useNotificationsContext } from '@/contexts/notifications-context'

/**
 * Hook to consume the singleton notifications state.
 * Refactored to use NotificationsProvider for cross-component stability.
 */
export function useNotifications() {
  return useNotificationsContext()
}
