'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { CalendarDays, Clock, Loader2, CalendarX2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { appointmentsApi } from '@/lib/api'
import { Appointment } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia } from '@/components/ui/empty'

export default function PatientAppointments() {
  const { user } = useAuth()
  const { toast } = useToast()
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
    const previousAppointments = [...appointments]
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

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const h = parseInt(hours)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12.toString().padStart(2, '0')}:${minutes} ${ampm}`
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-[#001f3f] tracking-tight">My Appointments</h1>
        <p className="text-gray-500 mt-1">Manage your upcoming and past medical visits.</p>
      </div>

      <Card className="border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-[#001f3f] animate-spin" />
              <p className="text-gray-500">Loading your appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="py-20">
              <Empty>
                 <EmptyMedia variant="icon">
                    <CalendarX2 className="w-12 h-12 text-gray-300" />
                 </EmptyMedia>
                 <EmptyHeader>
                    <EmptyTitle>No appointments yet</EmptyTitle>
                    <EmptyDescription>
                      You haven't booked any appointments with our doctors yet.
                    </EmptyDescription>
                 </EmptyHeader>
              </Empty>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold px-6">Doctor</TableHead>
                  <TableHead className="font-semibold">Date & Time</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((apt) => (
                  <TableRow key={apt.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#001f3f]/10 flex items-center justify-center text-[#001f3f] font-bold text-sm ring-1 ring-[#001f3f]/20 uppercase">
                          {apt.doctor_info?.user_name?.substring(0, 2) || "Dr"}
                        </div>
                        <div>
                          <p className="font-bold text-[#001f3f] text-sm">{apt.doctor_info?.user_name || "Unknown Doctor"}</p>
                          <p className="text-xs text-gray-500">{apt.doctor_info?.specialization_name || "Specialist"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium inline-flex items-center gap-1.5">
                          <CalendarDays className="w-3 h-3 text-gray-400" />
                          {new Date(apt.date).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-500 inline-flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3 h-3 text-gray-400" />
                          {formatTime(apt.time_slot)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(apt.status)}
                    </TableCell>
                    <TableCell className="text-right px-6">
                      {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && apt.patient === user?.profile_id && (
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="h-8 text-xs font-semibold"
                          onClick={() => handleCancel(apt.id)}
                          disabled={cancellingId === apt.id}
                        >
                          {cancellingId === apt.id ? "Wait..." : "Cancel"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
