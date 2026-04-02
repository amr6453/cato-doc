'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft, Settings as SettingsIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProfileForm } from '@/components/profile-form'
import { doctorApi, patientApi } from '@/lib/api'
import Link from 'next/link'

export default function SettingsPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    const fetchProfile = async () => {
      if (!user) return
      
      try {
        if (user.role === 'DOCTOR' && user.profile_id) {
          const data = await doctorApi.getDoctorById(user.profile_id)
          setProfileData(data)
        } else if (user.role === 'PATIENT') {
          const data = await patientApi.getProfile()
          if (data && data.length > 0) {
            setProfileData(data[0])
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchProfile()
    }
  }, [user, authLoading, isAuthenticated, router])

  if (authLoading || (loading && !profileData)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin text-[#001f3f]" />
      </div>
    )
  }

  if (!user) return null

  const dashboardHref = user.role === 'DOCTOR' ? '/dashboard/doctor' : '/dashboard/patient'

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link href={dashboardHref}>
            <Button variant="ghost" className="text-slate-600 hover:text-[#001f3f] font-bold">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-[#001f3f]" />
            <h1 className="text-2xl font-black text-[#001f3f] tracking-tight uppercase">Settings</h1>
          </div>
        </div>

        <Card className="border-none shadow-2xl shadow-blue-900/5 bg-white overflow-hidden rounded-[32px]">
          <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#001f3f] to-blue-600" />
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-3xl font-black text-[#001f3f]">Profile Management</CardTitle>
            <CardDescription className="text-lg font-medium text-slate-500">
              Update your personal information and profile picture.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <ProfileForm user={user} initialData={profileData} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none shadow-lg shadow-slate-200 bg-white p-6 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors">
            <div className="space-y-1">
              <h3 className="font-bold text-[#001f3f]">Security</h3>
              <p className="text-xs text-slate-500">Update password and 2FA</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-[#001f3f] group-hover:text-white transition-all">
              <SettingsIcon className="w-5 h-5" />
            </div>
          </Card>
          
          <Card className="border-none shadow-lg shadow-slate-200 bg-white p-6 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors opacity-50">
            <div className="space-y-1">
              <h3 className="font-bold text-[#001f3f]">Notifications</h3>
              <p className="text-xs text-slate-500">Coming Soon</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-300 flex items-center justify-center">
              <span className="text-[10px] font-bold">SOON</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
