'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { useAuth } from '@/contexts/auth-context'
import { appointmentsApi } from '@/lib/api'
import { Availability } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import { Loader2, Plus, Trash2, CalendarDays, Clock, ChevronLeft, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const PREDEFINED_TIMES = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', 
  '15:00', '15:30', '16:00', '16:30', '17:00'
]

export default function ManageSchedule() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Selection state
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([])
  const [selectedTimes, setSelectedTimes] = useState<string[]>([])
  
  // Protect the route
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/dashboard/doctor/schedule')
      } else if (user?.role?.toUpperCase() !== 'DOCTOR') {
        router.push('/dashboard/patient')
      }
    }
  }, [authLoading, isAuthenticated, user, router])

  const fetchSchedule = async () => {
    try {
      setLoading(true)
      const data = await appointmentsApi.getAvailabilities()
      setAvailabilities(data)
    } catch (error) {
      console.error('Failed to fetch schedule:', error)
      toast({
        title: "Error",
        description: "Failed to load your schedule. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && user?.role === 'DOCTOR') {
      fetchSchedule()
    }
  }, [isAuthenticated, user])

  const handleTimeToggle = (time: string) => {
    setSelectedTimes(prev => 
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    )
  }

  const handleBulkCreate = async () => {
    if (!selectedDates || selectedDates.length === 0 || selectedTimes.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select at least one date and one time slot.",
        variant: "destructive"
      })
      return
    }

    setSaving(true)
    try {
      const datesStr = selectedDates.map(d => formatDate(d))
      await appointmentsApi.bulkCreateAvailabilities({
        dates: datesStr,
        start_times: selectedTimes.map(t => `${t}:00`),
        duration_minutes: 30
      })
      
      toast({
        title: "Schedule Updated",
        description: "Successfully added new availability slots.",
      })
      
      // Reset selection
      setSelectedDates([])
      setSelectedTimes([])
      
      // Refresh list
      fetchSchedule()
    } catch (error) {
      console.error('Failed to create slots:', error)
      toast({
        title: "Update Failed",
        description: "Failed to save availability slots. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSlot = async (id: number) => {
    try {
      await appointmentsApi.deleteAvailability(id)
      setAvailabilities(prev => prev.filter(a => a.id !== id))
      toast({
        title: "Slot Deleted",
        description: "The availability slot has been removed.",
      })
    } catch (error) {
      console.error('Failed to delete slot:', error)
      toast({
        title: "Deletion Failed",
        description: "Only unbooked slots can be deleted.",
        variant: "destructive"
      })
    }
  }

  if (authLoading || (isAuthenticated && user?.role === 'DOCTOR' && loading && availabilities.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-[#001f3f] animate-spin" />
        <p className="text-gray-500 font-medium">Loading your schedule...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/doctor">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#001f3f] tracking-tight flex items-center gap-3">
            <CalendarDays className="w-8 h-8 text-blue-600" />
            Manage Availability
          </h1>
          <p className="text-gray-500 mt-1">Select dates and times to create new available slots for patients.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Creation Form */}
        <div className="xl:col-span-2 space-y-8">
          <Card className="border-none shadow-xl shadow-blue-900/5">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="text-lg font-bold">Add New Slots</CardTitle>
              <CardDescription>Select one or more dates and the times you are available.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Date Picker */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</span>
                    Select Dates
                  </h3>
                  <div className="border rounded-xl p-2 bg-white flex justify-center">
                    <Calendar
                      mode="multiple"
                      selected={selectedDates}
                      onSelect={setSelectedDates}
                      fromDate={new Date()}
                      className="rounded-md border-none"
                    />
                  </div>
                </div>

                {/* Time Picker */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">2</span>
                    Select Time Slots
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {PREDEFINED_TIMES.map(time => (
                      <Button
                        key={time}
                        variant={selectedTimes.includes(time) ? "default" : "outline"}
                        size="sm"
                        className={`font-semibold ${selectedTimes.includes(time) ? 'bg-blue-600' : 'hover:bg-blue-50'}`}
                        onClick={() => handleTimeToggle(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-gray-50/50 p-6 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                <span className="font-bold text-blue-600">{selectedDates?.length || 0}</span> dates, 
                <span className="font-bold text-blue-600"> {selectedTimes.length}</span> times = 
                <span className="font-bold text-[#001f3f]"> {(selectedDates?.length || 0) * selectedTimes.length}</span> total slots
              </div>
              <Button 
                onClick={handleBulkCreate} 
                disabled={saving || (selectedDates?.length === 0) || (selectedTimes.length === 0)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 px-8"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Schedule
              </Button>
            </CardFooter>
          </Card>

          {/* Existing Slots Mobile/List View */}
          <Card className="border-none shadow-xl shadow-blue-900/5 overflow-hidden block xl:hidden">
              <CardHeader className="border-b bg-gray-50/50">
                  <CardTitle className="text-lg font-bold">Your Available Slots</CardTitle>
              </CardHeader>
              <CardContent className="p-0 max-h-[400px] overflow-y-auto">
                {availabilities.length === 0 ? (
                    <div className="py-10 text-center text-gray-400">No active slots found.</div>
                ) : (
                    <div className="divide-y">
                        {availabilities.map(slot => (
                            <div key={slot.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col">
                                    <span className="font-bold text-[#001f3f]">{new Date(slot.date).toLocaleDateString()}</span>
                                    <span className="text-sm text-gray-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant={slot.is_booked ? "secondary" : "default"} className={slot.is_booked ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}>
                                        {slot.is_booked ? "Booked" : "Available"}
                                    </Badge>
                                    {!slot.is_booked && (
                                        <Button variant="ghost" size="sm" onClick={() => handleDeleteSlot(slot.id)} className="text-gray-400 hover:text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
              </CardContent>
          </Card>
        </div>

        {/* Desktop Sidebar List */}
        <div className="hidden xl:block">
            <Card className="border-none shadow-xl shadow-blue-900/5 sticky top-8 overflow-hidden h-fit flex flex-col max-h-[calc(100vh-200px)]">
                <CardHeader className="border-b bg-[#001f3f] text-white">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        Current Slots
                        <Badge variant="outline" className="ml-auto text-white border-white/20 bg-white/10">
                            {availabilities.length}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-y-auto">
                    {availabilities.length === 0 ? (
                        <div className="py-20 text-center px-6">
                            <Clock className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-400 font-medium">No slots scheduled yet.</p>
                            <p className="text-xs text-gray-300 mt-1">Fill the form to start receiving bookings.</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {availabilities.map(slot => (
                                <div key={slot.id} className="p-4 group hover:bg-blue-50/50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-[#001f3f]">{new Date(slot.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-xs border-gray-200 bg-white text-gray-600">
                                                    {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                                                </Badge>
                                                {slot.is_booked ? (
                                                     <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none text-[10px] h-5">Booked</Badge>
                                                ) : (
                                                     <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none text-[10px] h-5">Free</Badge>
                                                )}
                                            </div>
                                        </div>
                                        {!slot.is_booked && (
                                            <button 
                                                onClick={() => handleDeleteSlot(slot.id)}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
                {availabilities.length > 0 && (
                    <CardFooter className="p-4 border-t bg-gray-50/80 text-[10px] text-gray-400 text-center justify-center font-medium">
                        Only unbooked slots can be removed.
                    </CardFooter>
                )}
            </Card>
        </div>
      </div>
    </div>
  )
}
