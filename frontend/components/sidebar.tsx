'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { 
  LayoutDashboard, 
  Calendar, 
  User, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Activity,
  Users,
  Clock,
  Home,
  Menu
} from 'lucide-react'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'

export interface SidebarItem {
  title: string
  href: string
  icon: any
}

export function SidebarContent({ className, onItemClick, isCollapsed }: { className?: string, onItemClick?: () => void, isCollapsed?: boolean }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const patientItems: SidebarItem[] = [
    { title: 'Dashboard', href: '/dashboard/patient', icon: LayoutDashboard },
    { title: 'My Appointments', href: '/dashboard/patient/appointments', icon: Calendar },
    { title: 'Find Doctors', href: '/doctors', icon: Users },
    { title: 'Health Profile', href: '/dashboard/patient/profile', icon: Activity },
  ]

  const doctorItems: SidebarItem[] = [
    { title: 'Overview', href: '/dashboard/doctor', icon: LayoutDashboard },
    { title: 'Appointments', href: '/dashboard/doctor/appointments', icon: Clock },
    { title: 'My Schedule', href: '/dashboard/doctor/schedule', icon: Calendar },
    { title: 'Settings', href: '/dashboard/doctor/settings', icon: Settings },
  ]

  const items = user?.role === 'DOCTOR' ? doctorItems : patientItems

  return (
    <div className={cn("flex flex-col h-full bg-white", className)}>
      <div className={cn("flex h-20 items-center px-6 border-b shrink-0", isCollapsed && "justify-center px-0")}>
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#001f3f] to-blue-900 shadow-lg shadow-blue-900/20">
            <span className="text-xl font-black text-white">C</span>
          </div>
          {!isCollapsed && (
            <span className="text-2xl font-black text-[#001f3f] tracking-tighter whitespace-nowrap">
              CatoDoc
            </span>
          )}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-8 px-4 space-y-2 custom-scrollbar">
        {items.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} onClick={onItemClick}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full h-12 transition-all duration-300 group relative rounded-2xl",
                  isCollapsed ? "justify-center px-0" : "justify-start gap-4 px-4",
                  isActive 
                    ? "bg-[#001f3f] text-white hover:bg-[#001f3f]/90 shadow-md shadow-blue-900/10" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-[#001f3f]"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-[#001f3f]")} />
                {!isCollapsed && <span className="font-bold text-sm tracking-tight">{item.title}</span>}
                {isActive && !isCollapsed && (
                  <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </Button>
            </Link>
          )
        })}
      </div>

      <div className="p-4 border-t bg-slate-50/50 shrink-0">
        {!isCollapsed && (
            <div className="flex items-center gap-3 p-3 mb-4 bg-white rounded-[20px] shadow-sm border border-slate-100 ring-1 ring-slate-200/50 overflow-hidden">
                <Avatar className="h-10 w-10 border-2 border-slate-50 shrink-0">
                    <AvatarImage src={user?.image} />
                    <AvatarFallback className="bg-blue-600 text-white font-black uppercase text-xs">
                        {user?.username?.substring(0, 2)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                    <p className="text-xs font-black text-[#001f3f] truncate leading-none mb-1">
                        {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
                    </p>
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest opacity-70">
                        {user?.role}
                    </p>
                </div>
            </div>
        )}

        <div className="space-y-1">
            {(() => {
                const href = user?.role === 'DOCTOR' ? '/dashboard/doctor/settings' : '/dashboard/patient/settings'
                const isActive = pathname === href
                return (
                    <Link href={href}>
                        <Button 
                            variant="ghost" 
                            className={cn(
                                "w-full font-bold rounded-xl h-10 transition-all",
                                isCollapsed ? "justify-center px-0" : "justify-start gap-3 px-3",
                                isActive 
                                    ? "bg-[#001f3f] text-white hover:bg-[#001f3f]/90" 
                                    : "text-slate-600 hover:bg-white hover:text-[#001f3f]"
                            )}
                            onClick={onItemClick}
                        >
                            <User className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-500")} />
                            {!isCollapsed && <span className="text-xs">{isActive ? 'Settings Active' : 'Account Settings'}</span>}
                        </Button>
                    </Link>
                )
            })()}
            <Button
                variant="ghost"
                className={cn(
                    "w-full text-rose-500 font-bold hover:bg-rose-50 hover:text-rose-600 rounded-xl h-10 transition-colors",
                    isCollapsed ? "justify-center px-0" : "justify-start gap-3 px-3"
                )}
                onClick={() => logout()}
            >
                <LogOut className="h-4 w-4" />
                {!isCollapsed && <span className="text-xs">Sign Out</span>}
            </Button>
        </div>
      </div>
    </div>
  )
}

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside 
      className={cn(
        "hidden md:flex flex-col border-r bg-white transition-all duration-500 ease-in-out z-40 sticky top-0 h-screen shadow-[1px_0_10px_rgba(0,0,0,0.02)]",
        isCollapsed ? "w-[88px]" : "w-72"
      )}
    >
      <SidebarContent isCollapsed={isCollapsed} />
      
      {/* IMPROVED TOGGLE BUTTON - 3 BARS (HAMBURGER) */}
      <Button
        variant="secondary"
        size="icon"
        className={cn(
            "absolute -right-5 top-7 h-10 w-10 rounded-2xl border-4 border-slate-50 shadow-xl bg-white flex items-center justify-center hover:scale-110 transition-all duration-300 group z-50",
            isCollapsed && "right-[-20px]"
        )}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex flex-col gap-1 items-center justify-center">
            <div className={cn("h-0.5 w-4 bg-[#001f3f] rounded-full transition-all", !isCollapsed && "w-3 translate-x-[-2px]")} />
            <div className="h-0.5 w-4 bg-[#001f3f] rounded-full" />
            <div className={cn("h-0.5 w-4 bg-[#001f3f] rounded-full transition-all", !isCollapsed && "w-3 translate-x-[-2px]")} />
        </div>
      </Button>
    </aside>
  )
}
