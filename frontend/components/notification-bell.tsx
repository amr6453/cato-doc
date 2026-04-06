'use client'

import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/hooks/useNotifications'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

export function NotificationBell({ className }: { className?: string }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("relative h-9 w-9 rounded-full bg-slate-50 hover:bg-slate-100", className)}>
          <Bell className="h-5 w-5 text-slate-500" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white border-2 border-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <button 
              onClick={(e) => {
                e.stopPropagation()
                markAllAsRead()
              }}
              className="text-[10px] font-medium text-blue-600 hover:underline"
            >
              Mark all as read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-8 px-4 text-center text-xs text-slate-400">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id} 
                className={cn(
                  "flex flex-col items-start gap-1 p-3 cursor-pointer",
                  !notification.is_read && "bg-blue-50/50"
                )}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <p className={cn("text-xs leading-tight", !notification.is_read ? "font-bold text-[#001f3f]" : "text-slate-600")}>
                    {notification.message}
                  </p>
                  {!notification.is_read && (
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0 mt-1" />
                  )}
                </div>
                <span className="text-[10px] text-slate-400">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
