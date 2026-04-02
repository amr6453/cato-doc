'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CalendarDays, Clock, User, FileText, Plus, ArrowUpRight, Activity, Heart, Droplets, Loader2, CalendarX2 } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { appointmentsApi } from '@/lib/api'
import { Appointment } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia } from '@/components/ui/empty'

import { useRouter } from 'next/navigation'

export default function PatientDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  // Redirects and protection are now handled by /dashboard/layout.tsx
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const data = await appointmentsApi.getMyAppointments()
      setAppointments(data)
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
      toast({
        title: "Error",
        description: "Failed to load your appointments. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const handleCancel = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return

    // Save previous state for rollback if needed
    const previousAppointments = [...appointments]
    
    // Optimistic UI update
    setAppointments(prev => prev.map(apt => 
      apt.id === id ? { ...apt, status: 'CANCELLED' as const } : apt
    ))

    setCancellingId(id)
    try {
      await appointmentsApi.cancelAppointment(id)
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been successfully cancelled.",
      })
    } catch (error) {
      console.error('Failed to cancel appointment:', error)
      // Rollback on failure
      setAppointments(previousAppointments)
      
      toast({
        title: "Cancellation Failed",
        description: "Could not cancel the appointment. Please try again.",
        variant: "destructive"
      })
    } finally {
      setCancellingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-100">Pending</Badge>
      case 'CONFIRMED':
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">Confirmed</Badge>
      case 'COMPLETED':
        return <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-100">Completed</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-100">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Helper to format time
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const h = parseInt(hours)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12.toString().padStart(2, '0')}:${minutes} ${ampm}`
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#001f3f] tracking-tight">
            Premium Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Welcome back, <span className="text-primary font-bold">{user?.first_name || user?.username || 'Guest'}</span>. Here is your health overview.</p>
        </div>
        <Button asChild className="bg-[#001f3f] shadow-lg shadow-blue-900/20 h-12 px-6 rounded-xl flex items-center gap-2 group hover:scale-[1.02] transition-all">
          <Link href="/doctors">
            <Plus className="w-5 h-5" />
            <span className="font-bold">Book New Appointment</span>
            <ArrowUpRight className="ml-1 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </Button>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-2xl shadow-blue-900/10 bg-gradient-to-br from-white to-blue-50/50 overflow-hidden relative group hover:shadow-blue-900/20 transition-all duration-500">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Total Visits</CardTitle>
            <Activity className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-[#001f3f]">{appointments.filter(a => a.status === 'COMPLETED').length}</div>
            <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-tighter">Verified records</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl shadow-red-900/10 bg-gradient-to-br from-white to-red-50/50 overflow-hidden relative group hover:shadow-red-900/20 transition-all duration-500">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black text-red-600 uppercase tracking-[0.2em]">Heart Rate</CardTitle>
            <Heart className="w-5 h-5 text-red-600 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-[#001f3f]">72 <span className="text-sm font-bold text-gray-400">bpm</span></div>
            <div className="flex items-center gap-1.5 mt-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <p className="text-[10px] text-green-600 font-bold uppercase tracking-tighter">Optimal Condition</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl shadow-green-900/10 bg-gradient-to-br from-white to-green-50/50 overflow-hidden relative group hover:shadow-green-900/20 transition-all duration-500">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black text-green-600 uppercase tracking-[0.2em]">Glucose</CardTitle>
            <Droplets className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-[#001f3f]">98 <span className="text-sm font-bold text-gray-400">mg/dL</span></div>
            <p className="text-[10px] text-green-700 font-black mt-1 uppercase tracking-tighter bg-green-100/50 px-2 py-0.5 rounded-md w-fit">Excellent</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl shadow-blue-900/20 bg-[#001f3f] text-white overflow-hidden relative group hover:scale-[1.02] transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black text-blue-200 uppercase tracking-[0.2em]">Health Score</CardTitle>
            <Activity className="w-5 h-5 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">84%</div>
            <Progress value={84} className="h-2 mt-3 bg-white/20" />
            <p className="text-[10px] text-blue-200/60 font-medium mt-2">Better than 89% of patients</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Next Appointment Preview */}
        <Card className="lg:col-span-2 border-none shadow-xl shadow-gray-200/50 overflow-hidden relative bg-white">
           <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black text-[#001f3f]">Upcoming Appointment</CardTitle>
              <CardDescription>Your next scheduled visit</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-primary font-bold gap-1">
                <Link href="/dashboard/patient/appointments">
                    View All
                    <ArrowUpRight className="w-4 h-4" />
                </Link>
            </Button>
          </CardHeader>
          <CardContent className="py-6">
            {appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING').slice(0, 1).map(apt => (
                <div key={apt.id} className="flex flex-col md:flex-row gap-6 items-center bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                    <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center text-primary text-3xl font-black border border-slate-100">
                        {apt.doctor_info?.user_name?.substring(0, 2) || "Dr"}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-2xl font-black text-[#001f3f]">{apt.doctor_info?.user_name}</h3>
                        <p className="text-gray-500 font-medium">{apt.doctor_info?.specialization_name}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                                <CalendarDays className="w-4 h-4 text-primary" />
                                {new Date(apt.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                                <Clock className="w-4 h-4 text-primary" />
                                {formatTime(apt.time_slot)}
                            </div>
                        </div>
                    </div>
                    <div className="shrink-0">
                        {getStatusBadge(apt.status)}
                    </div>
                </div>
            ))}
            {appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING').length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                        <CalendarX2 className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-gray-500 font-medium max-w-xs">You have no upcoming appointments at the moment.</p>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          <Card className="border-none bg-gradient-to-br from-[#001f3f] to-[#003366] text-white overflow-hidden relative group shadow-2xl shadow-blue-900/30">
            <div className="absolute right-0 top-0 opacity-10 -translate-y-4 translate-x-4">
              <FileText className="w-32 h-32" />
            </div>
            <CardHeader>
              <CardTitle className="text-xl font-black">Medical Reports</CardTitle>
              <CardDescription className="text-blue-100/60 font-bold">Encrypted & Secure</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 w-2/3" />
                  </div>
                  <p className="text-sm text-blue-100/50 italic font-medium">Auto-syncing with 4 healthcare providers...</p>
               </div>
            </CardContent>
            <CardFooter>
                 <Button className="w-full bg-white text-[#001f3f] hover:bg-gray-100 font-black h-12 rounded-xl shadow-lg ring-4 ring-white/5 transition-all">
                    Upload Records
                 </Button>
            </CardFooter>
          </Card>

          <Card className="border-none shadow-xl shadow-gray-200/50 p-6 space-y-4 bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 rounded-bl-[50px] -translate-y-2 translate-x-2" />
              <div className="flex items-center gap-3 relative">
                <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center shadow-inner">
                    <Heart className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-black text-[#001f3f] text-lg">Daily Insight</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed font-medium italic">
                "Small, consistent steps in nutrition lead to massive transformations in metabolic health over time."
              </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
