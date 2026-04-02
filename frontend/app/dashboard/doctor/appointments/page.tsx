'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { CalendarDays, Clock, CheckCircle2, Loader2, CalendarX2, Check } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { appointmentsApi } from '@/lib/api'
import { Appointment } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'

export default function DoctorAppointments() {
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  
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
        description: "Failed to load appointments.",
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
    const previousAppointments = [...appointments]
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
        description: `Appointment ${type.toLowerCase()}ed.`,
      })
    } catch (error) {
      setAppointments(previousAppointments)
      toast({ title: "Failed", variant: "destructive" })
    } finally {
      setProcessingId(null)
      setActionType(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge variant="secondary" className="bg-amber-50 text-amber-700">Pending</Badge>
      case 'CONFIRMED': return <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">Confirmed</Badge>
      case 'COMPLETED': return <Badge variant="secondary" className="bg-blue-50 text-blue-700">Completed</Badge>
      case 'CANCELLED': return <Badge variant="destructive" className="bg-rose-50 text-rose-700">Cancelled</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatTime = (time: string) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const h = parseInt(hours)
    const ampm = h >= 12 ? 'PM' : 'AM'
    return `${(h % 12 || 12).toString().padStart(2, '0')}:${minutes} ${ampm}`
  }

  const activeAppointments = appointments
    .filter(apt => apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED')
    .sort((a, b) => a.date.localeCompare(b.date) || a.time_slot.localeCompare(b.time_slot))

  const historyAppointments = appointments
    .filter(apt => apt.status === 'COMPLETED' || apt.status === 'CANCELLED')
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-[#001f3f] tracking-tight">Appointments Management</h1>
        <p className="text-gray-500 mt-1">Accept, decline, or complete patient visits.</p>
      </div>

      <div className="space-y-8">
        <Card className="border-none shadow-xl overflow-hidden">
          <CardHeader className="bg-gray-50/50">
            <CardTitle>Upcoming Schedule</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {activeAppointments.length === 0 ? (
                <div className="py-20 text-center text-gray-400 font-medium">No active appointments.</div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="px-6">Patient</TableHead>
                            <TableHead>Time Slot</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right px-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activeAppointments.map((apt) => (
                            <TableRow key={apt.id}>
                                <TableCell className="px-6 py-4 font-bold">{apt.patient_info?.user_name || "Patient"}</TableCell>
                                <TableCell>
                                    <div className="text-sm">{new Date(apt.date).toLocaleDateString()} at {formatTime(apt.time_slot)}</div>
                                </TableCell>
                                <TableCell>{getStatusBadge(apt.status)}</TableCell>
                                <TableCell className="text-right px-6">
                                    <div className="flex justify-end gap-2">
                                        {apt.status === 'PENDING' && apt.doctor === user?.profile_id && (
                                            <>
                                                <Button size="sm" onClick={() => handleAction(apt.id, 'CONFIRM')} disabled={!!processingId}>Accept</Button>
                                                <Button size="sm" variant="outline" onClick={() => handleAction(apt.id, 'CANCEL')} disabled={!!processingId}>Decline</Button>
                                            </>
                                        )}
                                        {apt.status === 'CONFIRMED' && apt.doctor === user?.profile_id && (
                                            <Button size="sm" className="bg-blue-600" onClick={() => handleAction(apt.id, 'COMPLETE')} disabled={!!processingId}>Complete</Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
          <CardHeader className="bg-gray-50/50">
            <CardTitle className="text-lg">History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <Table>
                <TableBody>
                    {historyAppointments.map(apt => (
                        <TableRow key={apt.id}>
                            <TableCell className="px-6">{apt.patient_info?.user_name}</TableCell>
                            <TableCell>{new Date(apt.date).toLocaleDateString()}</TableCell>
                            <TableCell>{getStatusBadge(apt.status)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
             </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
