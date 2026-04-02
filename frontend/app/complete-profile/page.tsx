'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { doctorApi, patientApi, clinicsApi, parseApiError } from '@/lib/api'
import { Specialization } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { Loader2, User, Stethoscope, Briefcase, Calendar, MapPin, DollarSign, ArrowRight } from 'lucide-react'

export default function CompleteProfile() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [specialties, setSpecialties] = useState<Specialization[]>([])
  
  // Doctor form state
  const [doctorData, setDoctorData] = useState({
    specialization: '',
    bio: '',
    consultation_fee: '',
    years_of_experience: '',
    clinic_address: '',
  })

  // Patient form state
  const [patientData, setPatientData] = useState({
    date_of_birth: '',
    phone_number: '',
    medical_history: '',
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
    
    if (user?.has_profile) {
      router.push(user.role === 'DOCTOR' ? '/dashboard/doctor' : '/dashboard/patient')
    }

    if (user?.role === 'DOCTOR') {
      const fetchSpecialties = async () => {
        try {
          const data = await clinicsApi.getSpecialties()
          setSpecialties(data)
        } catch (error) {
          console.error('Failed to fetch specialties', error)
        }
      }
      fetchSpecialties()
    }
  }, [user, authLoading, isAuthenticated, router])

  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await doctorApi.createProfile({
        ...doctorData,
        specialization: parseInt(doctorData.specialization),
        consultation_fee: parseFloat(doctorData.consultation_fee),
        years_of_experience: parseInt(doctorData.years_of_experience),
      })
      toast({
        title: "Profile Completed!",
        description: "Your doctor profile has been created successfully.",
      })
      window.location.href = '/dashboard/doctor' // Force refresh to update auth state
    } catch (error) {
      const apiError = parseApiError(error)
      toast({
        title: "Error",
        description: apiError.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await patientApi.createProfile(patientData)
      toast({
        title: "Profile Completed!",
        description: "Your patient profile has been created successfully.",
      })
      window.location.href = '/dashboard/patient' // Force refresh
    } catch (error) {
      const apiError = parseApiError(error)
      toast({
        title: "Error",
        description: apiError.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#001f3f]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-none shadow-xl bg-white/80 backdrop-blur-sm">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-xl" />
        
        <CardHeader className="space-y-1 pb-8 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight text-[#001f3f]">
            Finish Your Registration
          </CardTitle>
          <CardDescription className="text-gray-500 text-lg">
            Tell us a bit more about yourself to get started.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {user?.role === 'DOCTOR' ? (
            <form onSubmit={handleDoctorSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="specialization" className="text-sm font-semibold text-gray-700">Specialization</Label>
                  <Select 
                    onValueChange={(v) => setDoctorData(prev => ({ ...prev, specialization: v }))}
                    required
                  >
                    <SelectTrigger className="bg-gray-50/50 border-gray-200">
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consultation_fee" className="text-sm font-semibold text-gray-700">Consultation Fee ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      id="consultation_fee"
                      type="number"
                      placeholder="e.g. 50" 
                      className="pl-9 bg-gray-50/50 border-gray-200"
                      value={doctorData.consultation_fee}
                      onChange={(e) => setDoctorData(prev => ({ ...prev, consultation_fee: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-sm font-semibold text-gray-700">Years of Experience</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      id="experience"
                      type="number"
                      placeholder="e.g. 10" 
                      className="pl-9 bg-gray-50/50 border-gray-200"
                      value={doctorData.years_of_experience}
                      onChange={(e) => setDoctorData(prev => ({ ...prev, years_of_experience: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-semibold text-gray-700">Clinic Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      id="address"
                      placeholder="Street, City, Building" 
                      className="pl-9 bg-gray-50/50 border-gray-200"
                      value={doctorData.clinic_address}
                      onChange={(e) => setDoctorData(prev => ({ ...prev, clinic_address: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-semibold text-gray-700">Professional Bio</Label>
                <Textarea 
                  id="bio"
                  placeholder="Share your expertise and background..." 
                  className="min-h-[120px] bg-gray-50/50 border-gray-200 resize-none"
                  value={doctorData.bio}
                  onChange={(e) => setDoctorData(prev => ({ ...prev, bio: e.target.value }))}
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-[#001f3f] hover:bg-[#002f5f] h-12 text-lg font-bold shadow-lg shadow-blue-900/10 group transition-all" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Complete Profile"}
                {!loading && <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePatientSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="dob" className="text-sm font-semibold text-gray-700">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      id="dob"
                      type="date"
                      className="pl-9 bg-gray-50/50 border-gray-200 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      value={patientData.date_of_birth}
                      onChange={(e) => setPatientData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      id="phone"
                      placeholder="+20 1XX XXX XXXX" 
                      className="pl-9 bg-gray-50/50 border-gray-200 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      value={patientData.phone_number}
                      onChange={(e) => setPatientData(prev => ({ ...prev, phone_number: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medical_history" className="text-sm font-semibold text-gray-700">Medical History</Label>
                <Textarea 
                  id="medical_history"
                  placeholder="Tell us about any chronic conditions, allergies, or past surgeries..." 
                  className="min-h-[120px] bg-gray-50/50 border-gray-200 resize-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  value={patientData.medical_history}
                  onChange={(e) => setPatientData(prev => ({ ...prev, medical_history: e.target.value }))}
                />
              </div>

              <Button type="submit" className="w-full bg-[#001f3f] hover:bg-[#002f5f] h-12 text-lg font-bold shadow-lg shadow-blue-900/10 group transition-all" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Finish Registration"}
                {!loading && <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>
          )}
        </CardContent>
        
        <CardFooter className="justify-center border-t py-4 bg-gray-50/50">
          <p className="text-xs text-gray-400">
            Secure Healthcare Registration powered by CatoDoc
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
