'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { CalendarDays, Clock, CheckCircle2, TrendingUp, Users, DollarSign, Loader2, CalendarX2, ArrowRight, Check } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { appointmentsApi } from '@/lib/api'
import { Appointment } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

import { useRouter } from 'next/navigation'

export default function DoctorDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  // Redirects and protection are now handled by /dashboard/layout.tsx

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [actionType, setActionType] = useState<'CONFIRM' | 'CANCEL' | 'COMPLETE' | null>(null)

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
    if (isAuthenticated && user?.role === 'DOCTOR') {
      fetchAppointments()
    }
  }, [isAuthenticated, user])

  const handleAction = async (id: number, type: 'CONFIRM' | 'CANCEL' | 'COMPLETE') => {
    // Save previous state for rollback
    const previousAppointments = [...appointments]
    
    // Optimistic UI update
    const newStatus = type === 'CONFIRM' ? 'CONFIRMED' : type === 'CANCEL' ? 'CANCELLED' : 'COMPLETED'
    setAppointments(prev => prev.map(apt => 
      apt.id === id ? { ...apt, status: newStatus as any } : apt
    ))

    setProcessingId(id)
    setActionType(type)
    
    try {
      if (type === 'CONFIRM') await appointmentsApi.confirmAppointment(id)
      else if (type === 'CANCEL') await appointmentsApi.cancelAppointment(id)
      else await appointmentsApi.completeAppointment(id)

      toast({
        title: "Success",
        description: "Appointment status updated.",
      })
    } catch (error) {
      setAppointments(previousAppointments)
      toast({
        title: "Action Failed",
        description: "Could not update the appointment status.",
        variant: "destructive"
      })
    } finally {
      setProcessingId(null)
      setActionType(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-100 ring-1 ring-amber-200/50">Pending</Badge>
      case 'CONFIRMED':
        return <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 ring-1 ring-emerald-200/50">Confirmed</Badge>
      case 'COMPLETED':
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 ring-1 ring-blue-200/50">Completed</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive" className="bg-rose-50 text-rose-700 border-rose-100 ring-1 ring-rose-200/50">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatTime = (time: string) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const h = parseInt(hours)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12.toString().padStart(2, '0')}:${minutes} ${ampm}`
  }

  const todayStr = formatDate(new Date())
  
  // Active appointments: All non-handled appointments (Pending/Confirmed), sorted by date
  const activeAppointments = appointments
    .filter(apt => apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED')
    .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date)
        if (dateCompare !== 0) return dateCompare
        return a.time_slot.localeCompare(b.time_slot)
    })

  // History: All handled appointments
  const historyAppointments = appointments
    .filter(apt => apt.status === 'COMPLETED' || apt.status === 'CANCELLED')
    .sort((a, b) => b.date.localeCompare(a.date)) // Most recent history first
  
  // Statistics
  const totalActiveAppointments = activeAppointments.length
  const todayAppointmentsCount = activeAppointments.filter(apt => apt.date === todayStr).length
  
  // Calculate revenue based on completed appointments
  const completedAppointments = appointments.filter(apt => apt.status === 'COMPLETED')
  const consultationFee = appointments[0]?.doctor_info?.consultation_fee || 0
  const totalRevenue = completedAppointments.length * Number(consultationFee)

  if (authLoading || (isAuthenticated && user?.role === 'DOCTOR' && loading && appointments.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-[#001f3f] animate-spin" />
        <p className="text-gray-500 font-medium">Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#001f3f] tracking-tight">
            Doctor Overview
          </h1>
          <p className="text-gray-500 mt-1">Monitor your practice performance and daily operations.</p>
        </div>
        <div className="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100 flex items-center gap-2 shadow-sm">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-bold text-blue-700">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="border-none shadow-2xl shadow-blue-900/10 bg-gradient-to-br from-white to-blue-50/50 overflow-hidden relative group hover:shadow-blue-900/20 transition-all duration-500">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Active Visits</CardTitle>
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center shadow-inner">
                <Users className="w-6 h-6 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black text-[#001f3f] tracking-tighter">{totalActiveAppointments}</div>
            <p className="text-xs text-gray-500 mt-3 flex items-center gap-1.5 font-bold uppercase tracking-tighter">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Scheduled for today
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl shadow-green-900/10 bg-gradient-to-br from-white to-green-50/50 overflow-hidden relative group hover:shadow-green-900/20 transition-all duration-500">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black text-green-600 uppercase tracking-[0.2em]">Revenue (Est.)</CardTitle>
            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center shadow-inner">
                <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black text-[#001f3f] tracking-tighter">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-3 font-bold uppercase tracking-tighter">From {completedAppointments.length} successful sessions</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl shadow-purple-900/20 bg-[#001f3f] text-white overflow-hidden relative group hover:scale-[1.02] transition-all duration-500">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform" />
           <CardHeader className="pb-2">
             <CardTitle className="text-xs font-black opacity-80 uppercase tracking-[0.2em] text-blue-100">Schedule Control</CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-sm text-blue-100/70 mb-6 font-medium leading-relaxed">Modify your available slots to optimize your daily practice flow.</p>
             <Link href="/dashboard/doctor/schedule" className="block w-full">
               <Button variant="secondary" className="w-full bg-white text-[#001f3f] hover:bg-gray-100 font-black h-12 rounded-xl shadow-lg group">
                  Manage Availability
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
               </Button>
             </Link>
           </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Next Patient Card */}
        <Card className="border-none shadow-2xl shadow-gray-200/50 overflow-hidden bg-white relative">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50/50 -skew-x-12 translate-x-1/2" />
          <CardHeader className="border-b bg-gray-50/30 relative">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center shadow-inner">
                        <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                     <div>
                       <CardTitle className="text-xl font-black text-[#001f3f]">Next Patient</CardTitle>
                       <CardDescription className="font-medium italic">Your upcoming session details</CardDescription>
                    </div>
                </div>
                <Button asChild variant="link" className="text-primary font-bold">
                    <Link href="/dashboard/doctor/appointments">View Full List</Link>
                </Button>
            </div>
          </CardHeader>
           <CardContent className="p-8 relative">
            {activeAppointments.length === 0 ? (
                <div className="py-10 flex flex-col items-center text-center">
                    <CalendarX2 className="w-16 h-16 text-gray-200 mb-4" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No Scheduled Patients</p>
                </div>
            ) : (
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-blue-600 to-indigo-700 p-1 shadow-xl shadow-blue-500/20">
                        <div className="w-full h-full rounded-[28px] bg-white/10 backdrop-blur-xl flex items-center justify-center text-white text-3xl font-black border border-white/20">
                            {activeAppointments[0].patient_info?.user_name?.substring(0, 2).toUpperCase()}
                        </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <Badge className="bg-blue-100/50 text-blue-700 border-none mb-2 font-black uppercase tracking-widest text-[10px]">Upcoming</Badge>
                        <h3 className="text-3xl font-black text-[#001f3f] tracking-tight">{activeAppointments[0].patient_info?.user_name}</h3>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                            <div className="flex items-center gap-2 font-bold text-gray-700 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                                <Clock className="w-4 h-4 text-blue-500" />
                                {formatTime(activeAppointments[0].time_slot)}
                            </div>
                            <div className="flex items-center gap-2 font-bold text-gray-700 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                                <CalendarDays className="w-4 h-4 text-blue-500" />
                                {activeAppointments[0].date === todayStr ? 'Today' : new Date(activeAppointments[0].date).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl shadow-gray-200/50 overflow-hidden bg-[#001f3f] text-white p-8 relative group">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform" />
            <div className="relative space-y-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                   <h3 className="text-2xl font-black tracking-tight">Efficiency Stats</h3>
                   <p className="text-blue-200/60 font-medium">Your practice is running at <span className="text-white font-black italic">94% capacity</span> this week.</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <p className="text-[10px] text-blue-200/50 font-bold uppercase tracking-widest mb-1">Avg Patient Wait</p>
                        <p className="text-xl font-black">12 min</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <p className="text-[10px] text-blue-200/50 font-bold uppercase tracking-widest mb-1">Satisfaction</p>
                        <p className="text-xl font-black">4.9/5</p>
                    </div>
                </div>
            </div>
        </Card>
      </div>
    </div>
  )
}
