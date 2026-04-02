'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Loader2 } from 'lucide-react'
import { Sidebar } from '@/components/sidebar'
import { MobileHeader } from '@/components/mobile-header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(`/login?redirect=${pathname}`)
      } else if (!user?.has_profile && pathname !== '/complete-profile') {
        router.push('/complete-profile')
      }
    }
  }, [isLoading, isAuthenticated, user, router, pathname])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-[#001f3f] animate-spin" />
        <p className="text-gray-500 font-medium">Authenticating...</p>
      </div>
    )
  }

  if (!isAuthenticated || (!user?.has_profile && pathname !== '/complete-profile')) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="flex min-h-screen bg-slate-50/50 flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
