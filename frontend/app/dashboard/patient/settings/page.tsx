'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/auth-context'
import { User, Bell, Shield, Wallet, Loader2 } from 'lucide-react'
import { patientApi } from '@/lib/api'
import { ProfileForm } from '@/components/profile-form'

export default function PatientSettings() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await patientApi.getProfile()
        // Assuming the first profile is the user's profile
        if (data && data.length > 0) {
          setProfileData(data[0])
        }
      } catch (error) {
        console.error('Failed to fetch patient profile', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [user])

  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#001f3f] tracking-tight">Account Settings</h1>
          <p className="text-gray-500 mt-1">Manage your identity and security preferences.</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-white border p-1 rounded-2xl h-14 shadow-sm">
          <TabsTrigger value="profile" className="rounded-xl font-bold px-6 h-full data-[state=active]:bg-slate-100 data-[state=active]:text-[#001f3f]">
            <User className="w-4 h-4 mr-2" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl font-bold px-6 h-full data-[state=active]:bg-slate-100 data-[state=active]:text-[#001f3f]">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-xl font-bold px-6 h-full data-[state=active]:bg-slate-100 data-[state=active]:text-[#001f3f]">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-none shadow-2xl shadow-blue-900/5 bg-white overflow-hidden rounded-[32px]">
              <CardHeader className="bg-slate-50/50 border-b p-8">
                <CardTitle className="text-xl font-black text-[#001f3f]">Personal Identity</CardTitle>
                <CardDescription className="font-medium italic">Update your basic contact and identification details.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {loading ? (
                  <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#001f3f]" />
                  </div>
                ) : (
                  <ProfileForm user={user} initialData={profileData} />
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-2xl shadow-blue-900/5 bg-[#001f3f] text-white overflow-hidden rounded-[32px] p-8 relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform" />
                <div className="relative h-full flex flex-col justify-between">
                    <div>
                        <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center mb-6">
                            <Wallet className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight mb-2 text-white">CatoDoc Wallet</h3>
                        <p className="text-blue-100/60 font-medium leading-relaxed italic text-sm">Save your insurance details for faster checkout and instant claim verification.</p>
                    </div>
                    <Button variant="secondary" className="w-full mt-10 bg-white text-[#001f3f] hover:bg-white/90 font-black h-12 rounded-xl">
                        Add Payment Method
                    </Button>
                </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
            <Card className="max-w-2xl border-none shadow-2xl shadow-rose-900/5 bg-white overflow-hidden rounded-[32px]">
              <CardHeader className="bg-rose-50/30 border-b p-8">
                <CardTitle className="text-xl font-black text-rose-900">Security Credentials</CardTitle>
                <CardDescription className="font-medium text-rose-700/60">Manage your password and authentication methods.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                  <p className="text-center italic text-gray-400 font-medium">Security settings are managed centrally. Please use the global settings page for password updates.</p>
              </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
            <Card className="max-w-2xl border-none shadow-2xl shadow-blue-900/5 bg-white overflow-hidden rounded-[32px]">
                <CardContent className="p-10 flex items-center justify-center min-h-[300px] text-center italic text-gray-400 font-medium">
                    <div className="space-y-4">
                        <Bell className="w-12 h-12 mx-auto opacity-20" />
                        <p>Detailed notification preferences coming soon.</p>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
