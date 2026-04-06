'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { doctorApi, appointmentsApi } from '@/lib/api'
import { DoctorProfile } from '@/lib/types'
import { useAuth } from '@/contexts/auth-context'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, MapPin, Clock, CalendarIcon, ChevronLeft, CheckCircle2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default function DoctorDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()
  
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [availabilities, setAvailabilities] = useState<any[]>([])
  const [availabilityLoading, setAvailabilityLoading] = useState(true)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [isBooked, setIsBooked] = useState(false)
  const [isBooking, setIsBooking] = useState(false)

  const doctorName = doctor?.user.first_name && doctor?.user.last_name 
    ? `Dr. ${doctor.user.first_name} ${doctor.user.last_name}`
    : doctor?.user.username ? `Dr. ${doctor.user.username}` : '';

  const fallbackImage = doctor?.user.username 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.user.username)}&background=001f3f&color=fff&size=512`
    : '';

  // Helper to format HH:MM:SS to 12h format
  const formatSlotTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const h = parseInt(hours)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12.toString().padStart(2, '0')}:${minutes} ${ampm}`
  }

  const now = new Date()
  const todayStr = formatDate(now)
  const currentTime = now.getHours() * 100 + now.getMinutes()

  const selectedDateStr = date ? formatDate(date) : ''
  const availableSlotsForDate = availabilities
    .filter(a => {
      if (a.date !== selectedDateStr) return false
      if (a.date === todayStr) {
        const [h, m] = a.start_time.split(':').map(Number)
        const slotTime = h * 100 + m
        return slotTime > currentTime
      }
      return true
    })
    .map(a => formatSlotTime(a.start_time))

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [doctorData, availabilityData] = await Promise.all([
          doctorApi.getDoctorById(id as string),
          doctorApi.getAvailability(id as string)
        ])
        setDoctor(doctorData)
        setAvailabilities(availabilityData)
      } catch (error) {
        console.error('Failed to fetch doctor details:', error)
      } finally {
        setLoading(false)
        setAvailabilityLoading(false)
      }
    }
    fetchData()
  }, [id])

  useEffect(() => {
    setSelectedSlot(null)
  }, [date])

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book an appointment.",
        variant: "destructive",
      })
      router.push(`/login?redirect=/doctors/${id}`)
      return
    }

    if (!doctor || !date || !selectedSlot) return
    
    setIsBooking(true)
    try {
      // Find the exact slot object to get the correct time format for backend
      const slotObj = availabilities.find(a => a.date === selectedDateStr && formatSlotTime(a.start_time) === selectedSlot)
      
      if (!slotObj) {
        toast({
          title: "Error",
          description: "Could not find the selected time slot.",
          variant: "destructive"
        })
        return
      }

      await appointmentsApi.createAppointment({
        doctor: doctor.id,
        date: selectedDateStr as string,
        time_slot: slotObj.start_time
      })

      setIsBooked(true)
      toast({
        title: "Appointment Successful",
        description: `Your appointment with ${doctorName} on ${date.toLocaleDateString()} at ${selectedSlot} has been confirmed.`,
      })
    } catch (error: any) {
      console.error('Booking failed:', error)
      
      // Parse detailed error message from response
      const serverError = error.response?.data
      let errorMessage = "An error occurred during booking."
      
      if (serverError) {
        if (typeof serverError === 'string') {
          errorMessage = serverError
        } else if (serverError.detail) {
          errorMessage = serverError.detail
        } else if (serverError && typeof serverError === 'object') {
          // Join all field errors if it's a validation error object
          const errors = Object.entries(serverError).map(([key, val]) => {
            const fieldName = key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')
            return `${fieldName}: ${Array.isArray(val) ? val.join(', ') : val}`
          })
          if (errors.length > 0) errorMessage = errors.join(' | ')
        }
      }

      toast({
        title: "Booking Failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsBooking(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        <Skeleton className="h-10 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-6">
              <Skeleton className="w-32 h-32 rounded-full" />
              <div className="space-y-4 flex-1">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
            <Skeleton className="h-[300px] w-full" />
          </div>
          <Skeleton className="h-[500px] w-full" />
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-2xl font-bold text-[#001f3f]">Doctor not found</h1>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/doctors">Back to Listings</Link>
        </Button>
      </div>
    )
  }

  const availability = availableSlotsForDate;

  if (isBooked) {
    return (
        <div className="container mx-auto px-4 py-20 flex justify-center">
            <Card className="max-w-md w-full text-center p-8">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                </div>
                <CardTitle className="text-2xl mb-2">Booking Successful!</CardTitle>
                <CardDescription className="text-gray-600 mb-6">
                    Your appointment with <strong>{doctorName}</strong> has been scheduled for 
                    <strong> {date?.toLocaleDateString()}</strong> at <strong>{selectedSlot}</strong>.
                </CardDescription>
                <div className="flex gap-4">
                    <Button asChild className="flex-1 bg-[#001f3f]" onClick={() => router.push('/dashboard/patient')}>
                        <Link href="/dashboard/patient">Go to Dashboard</Link>
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => window.location.reload()}>
                        Book Another
                    </Button>
                </div>
            </Card>
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button variant="ghost" asChild className="mb-6 -ml-2 text-gray-600 hover:text-[#001f3f]">
        <Link href="/doctors" className="flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back to Search
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Doctor Profile */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-none bg-transparent">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage src={doctor.profile_picture || fallbackImage} alt={doctorName} className="object-cover" />
                <AvatarFallback>{doctor.user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold text-[#001f3f]">{doctorName}</h1>
                  <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                    {doctor.specialization?.name || 'General Practitioner'}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                    <span className="font-semibold">{doctor.rating || '4.8'}</span>
                    <span className="text-gray-400 ml-1">(120+ reviews)</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                    <span>{doctor.clinic_address || 'Clinic Address'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600 font-medium pt-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Verified Provider
                </div>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="about" className="w-full">
            <TabsList className="bg-gray-100/50 p-1">
              <TabsTrigger value="about" className="data-[state=active]:bg-white data-[state=active]:text-[#001f3f]">About</TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-white data-[state=active]:text-[#001f3f]">Reviews</TabsTrigger>
              <TabsTrigger value="location" className="data-[state=active]:bg-white data-[state=active]:text-[#001f3f]">Location</TabsTrigger>
            </TabsList>
            <TabsContent value="about" className="pt-4 space-y-4">
              <h3 className="text-xl font-semibold text-[#001f3f]">Professional Bio</h3>
              <p className="text-gray-600 leading-relaxed">
                {doctor.bio || 'Experienced doctor dedicated to providing high-quality care to all patients. Specialized in modern medical practices and patient-centered treatment.'}
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <span className="text-xs uppercase text-gray-400 font-bold block mb-1">Experience</span>
                  <span className="font-medium text-gray-700">{doctor.years_of_experience} Years</span>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <span className="text-xs uppercase text-gray-400 font-bold block mb-1">Consultation Fee</span>
                  <span className="font-medium text-gray-700">${doctor.consultation_fee}</span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="pt-4">
                <p className="text-gray-500 italic">Patient reviews will be listed here.</p>
            </TabsContent>
            <TabsContent value="location" className="pt-4">
                <p className="text-gray-500">{doctor.clinic_address || 'Clinic location map will be displayed here.'}</p>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Booking */}
        <aside className="space-y-6">
          <Card className="border-[#001f3f]/10 shadow-xl overflow-hidden">
            <div className="p-6 bg-[#001f3f] text-white">
                <CardTitle className="text-xl">Book Appointment</CardTitle>
                <CardDescription className="text-blue-100/80">Select date and time</CardDescription>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-[#001f3f]" />
                    Select Date
                </label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  fromDate={new Date()}
                  className="rounded-md border shadow-sm w-full mx-auto"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#001f3f]" />
                    Available Slots
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availableSlotsForDate.length > 0 ? (
                    availableSlotsForDate.map((slot) => (
                      <Button
                        key={slot}
                        variant={selectedSlot === slot ? "default" : "outline"}
                        className={`h-11 transition-all ${
                          selectedSlot === slot 
                          ? "bg-[#001f3f] text-white" 
                          : "hover:border-[#001f3f] hover:text-[#001f3f]"
                        }`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {slot}
                      </Button>
                    ))
                  ) : (
                    <div className="col-span-2 py-4 text-center text-sm text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                      No slots available for this date.
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6 pt-0 border-t bg-gray-50/50 flex flex-col gap-4">
              <div className="flex justify-between w-full pt-4">
                <span className="text-gray-500">Consultation Fee</span>
                <span className="font-bold text-[#001f3f]">${doctor.consultation_fee}</span>
              </div>
              <Button 
                className="w-full h-12 bg-[#001f3f] hover:bg-[#001f3f]/90 text-lg shadow-lg shadow-blue-900/10"
                disabled={!date || !selectedSlot || isBooking}
                onClick={handleBooking}
              >
                {isBooking ? "Booking..." : "Book Appointment"}
              </Button>
              <p className="text-[10px] text-center text-gray-400 px-4">
                By clicking "Book Appointment" you agree to our terms of service and cancellation policy.
              </p>
            </CardFooter>
          </Card>

          <Card className="bg-blue-50 border-blue-100 p-4">
             <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-blue-900">Instant Confirmation</h4>
                    <p className="text-xs text-blue-700">Most appointments are confirmed within 15 minutes.</p>
                </div>
             </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}

