'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { doctorApi, clinicsApi } from '@/lib/api'
import { DoctorProfile, Specialization } from '@/lib/types'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Star, Filter, MapPin, Search, User } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia } from '@/components/ui/empty'
import Image from 'next/image'
import Link from 'next/link'

export default function DoctorsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [doctors, setDoctors] = useState<DoctorProfile[]>([])
  const [specialties, setSpecialties] = useState<Specialization[]>([])
  const [loading, setLoading] = useState(true)
  const [specialtyLoading, setSpecialtyLoading] = useState(true)
  const [priceRange, setPriceRange] = useState([
    Number(searchParams.get('min_price')) || 0,
    Number(searchParams.get('max_price')) || 500
  ])
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  
  // Get selected specialties from URL
  const selectedSpecialties = searchParams.get('specialization') 
    ? searchParams.get('specialization')!.split(',').map(Number) 
    : []

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const data = await clinicsApi.getSpecialties()
        setSpecialties(data)
      } catch (error) {
        console.error('Failed to fetch specialties:', error)
      } finally {
        setSpecialtyLoading(false)
      }
    }
    fetchSpecialties()
  }, [])

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true)
      try {
        const params: any = {}
        if (searchQuery) params.search = searchQuery
        
        // Use 'specialization' as per backend requirement
        const specs = searchParams.get('specialization')
        if (specs) params.specialization = specs

        const minPrice = searchParams.get('min_price')
        if (minPrice) params.consultation_fee__gte = minPrice
        
        const maxPrice = searchParams.get('max_price')
        if (maxPrice) params.consultation_fee__lte = maxPrice
        
        const data = await doctorApi.getDoctors(params)
        setDoctors(data)
      } catch (error) {
        console.error('Failed to fetch doctors:', error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(() => {
      fetchDoctors()
    }, 500) // Debounce search

    return () => clearTimeout(timer)
  }, [searchQuery, searchParams])

  const toggleSpecialty = (id: number) => {
    const params = new URLSearchParams(searchParams.toString())
    let current = params.get('specialization')?.split(',').filter(Boolean).map(Number) || []
    
    if (current.includes(id)) {
      current = current.filter(s => s !== id)
    } else {
      current = [...current, id]
    }
    
    if (current.length > 0) {
      params.set('specialization', current.join(','))
    } else {
      params.delete('specialization')
    }
    
    router.push(`${pathname}?${params.toString()}`)
  }

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#001f3f] mb-4">Filters</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="specialty">Specialty</Label>
            <div className="space-y-2 pt-2">
              {specialtyLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))
              ) : (
                specialties.map((s) => (
                  <div key={s.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`s-${s.id}`} 
                      checked={selectedSpecialties.includes(s.id)}
                      onCheckedChange={() => toggleSpecialty(s.id)}
                    />
                    <label 
                      htmlFor={`s-${s.id}`} 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {s.name}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Label>Price Range (${priceRange[0]} - ${priceRange[1]})</Label>
            <Slider
              defaultValue={[0, 500]}
              max={500}
              step={10}
              value={priceRange}
              onValueChange={setPriceRange}
              className="py-4"
            />
          </div>

          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="space-y-2 pt-2">
              {[4, 3, 2].map((r) => (
                <div key={r} className="flex items-center space-x-2">
                  <Checkbox id={`r-${r}`} />
                  <label htmlFor={`r-${r}`} className="text-sm font-medium leading-none flex items-center">
                    {r}+ <Star className="w-3 h-3 ml-1 fill-yellow-400 text-yellow-400" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Button 
        className="w-full bg-[#001f3f] hover:bg-[#001f3f]/90"
        onClick={() => {
          const params = new URLSearchParams(searchParams.toString())
          params.set('min_price', priceRange[0].toString())
          params.set('max_price', priceRange[1].toString())
          router.push(`${pathname}?${params.toString()}`)
        }}
      >
        Apply Filters
      </Button>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 shrink-0 sticky top-24 h-fit border p-6 rounded-xl bg-white shadow-sm">
          <FilterSidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search doctors by name..." 
                className="pl-10 border-gray-200" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Mobile Filter Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>Narrow down your search</SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSidebar />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              // Loading Skeletons
              Array(6).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden border-gray-100">
                  <Skeleton className="h-48 w-full" />
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent className="pb-4">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                  <CardFooter className="flex justify-between items-center bg-gray-50/50 pt-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-10 w-24" />
                  </CardFooter>
                </Card>
              ))
            ) : doctors.length === 0 ? (
              // Empty State
              <div className="col-span-full py-20">
                <Empty>
                  <EmptyMedia variant="icon">
                    <Search className="w-10 h-10 text-gray-400" />
                  </EmptyMedia>
                  <EmptyHeader>
                    <EmptyTitle>No doctors found</EmptyTitle>
                    <EmptyDescription>
                      We couldn't find any doctors matching your search or filters. Try adjusting your criteria.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button variant="outline" onClick={() => {
                      setSearchQuery('')
                      router.push(pathname)
                    }}>
                      Clear all filters
                    </Button>
                  </EmptyContent>
                </Empty>
              </div>
            ) : (
              // Doctors List
              doctors.map((doctor) => {
                const doctorName = doctor.user.first_name && doctor.user.last_name 
                  ? `Dr. ${doctor.user.first_name} ${doctor.user.last_name}`
                  : `Dr. ${doctor.user.username}`;
                
                const fallbackImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.user.username)}&background=001f3f&color=fff&size=512`;

                return (
                  <Card key={doctor.id} className="overflow-hidden hover:shadow-md transition-shadow border-gray-100 flex flex-col h-full">
                    <div className="relative h-48 w-full bg-gray-100 shrink-0">
                      {doctor.profile_picture ? (
                        <Image
                          src={doctor.profile_picture}
                          alt={doctorName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-50">
                          <Image
                            src={fallbackImage}
                            alt={doctorName}
                            fill
                            className="object-cover opacity-80"
                          />
                        </div>
                      )}
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg text-[#001f3f] line-clamp-1">{doctorName}</CardTitle>
                          <CardDescription className="font-medium text-blue-600">
                            {doctor.specialization?.name || 'General Practitioner'}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-100 shrink-0">
                          <Star className="w-3 h-3 mr-1 fill-yellow-600" />
                          {doctor.rating || '4.8'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4 flex-1 mt-auto">
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {doctor.bio || 'Experienced doctor dedicated to providing high-quality care to all patients.'}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-1 shrink-0" />
                        <span className="line-clamp-1">{doctor.clinic_address || 'Clinic Address'}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center bg-gray-50/50 pt-4 mt-auto">
                      <span className="text-lg font-bold text-[#001f3f]">
                        ${doctor.consultation_fee}
                        <span className="text-xs font-normal text-gray-500">/session</span>
                      </span>
                      <Button asChild className="bg-[#001f3f] hover:bg-[#001f3f]/90 shadow-sm">
                        <Link href={`/doctors/${doctor.id}`}>Book Now</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

