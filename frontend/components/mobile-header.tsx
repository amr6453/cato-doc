'use client'

import { Menu, Search, User, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sidebar } from './sidebar'
import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'
import { useState } from 'react'
import { 
    Sheet, 
    SheetContent, 
    SheetTrigger 
} from '@/components/ui/sheet'
import { NotificationBell } from './notification-bell'
import { SidebarContent } from './sidebar'

export function MobileHeader() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header className="md:hidden sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 border-none">
                <SidebarContent onItemClick={() => setOpen(false)} />
            </SheetContent>
        </Sheet>
        
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#001f3f]">
            <span className="text-lg font-bold text-white">C</span>
          </div>
          <span className="text-lg font-bold text-[#001f3f] tracking-tighter">CatoDoc</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />
        <Link href={user?.role === 'DOCTOR' ? '/dashboard/doctor/settings' : '/dashboard/patient/settings'}>
            <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 overflow-hidden">
                {user?.profile_picture ? (
                    <img src={user.profile_picture} alt="" className="h-full w-full object-cover" />
                ) : (
                    <User className="h-5 w-5 text-blue-600" />
                )}
            </div>
        </Link>
      </div>
    </header>
  )
}
