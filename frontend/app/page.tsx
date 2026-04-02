'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, Shield, Users, Stethoscope, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    icon: Calendar,
    title: 'Easy Scheduling',
    description: 'Book appointments with your preferred doctors in just a few clicks.',
  },
  {
    icon: Clock,
    title: '24/7 Availability',
    description: 'Schedule appointments anytime, anywhere, from any device.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your health information is protected with enterprise-grade security.',
  },
  {
    icon: Users,
    title: 'Verified Doctors',
    description: 'All healthcare professionals on our platform are verified and licensed.',
  },
]

export default function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (!user?.has_profile) {
        router.push('/complete-profile')
      } else {
        router.push(user.role === 'DOCTOR' ? '/dashboard/doctor' : '/dashboard/patient')
      }
    }
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading || (isAuthenticated && !isLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Healthcare Made{' '}
              <span className="text-primary">Simple</span>
            </h1>
            <p className="mt-6 text-pretty text-lg text-muted-foreground md:text-xl">
              Book appointments with trusted healthcare professionals. CatoDoc makes
              healthcare accessible, convenient, and secure for everyone.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {isAuthenticated ? (
                <>
                  {user?.role === 'PATIENT' && (
                    <Link href="/doctors">
                      <Button size="lg" className="gap-2">
                        Find a Doctor
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  {user?.role === 'DOCTOR' && (
                    <Link href="/dashboard/doctor/schedule">
                      <Button size="lg" className="gap-2">
                        Manage Schedule
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  {user?.role === 'ADMIN' && (
                    <Link href="/admin/dashboard">
                      <Button size="lg" className="gap-2">
                        Admin Dashboard
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  <Link href="/appointments">
                    <Button size="lg" variant="outline">
                      View Appointments
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/register">
                    <Button size="lg" className="gap-2">
                      Get Started Free
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/doctors">
                    <Button size="lg" variant="outline">
                      Browse Doctors
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Decorative background elements */}
        <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 left-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Why Choose CatoDoc?
            </h2>
            <p className="mt-4 text-muted-foreground">
              We are committed to making healthcare accessible and convenient for everyone.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-none bg-transparent">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4 text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <Stethoscope className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Join thousands of patients and healthcare professionals who trust CatoDoc
              for their appointment scheduling needs.
            </p>
            <div className="mt-8">
              {isAuthenticated ? (
                <Link href={user?.role === 'DOCTOR' ? '/dashboard/doctor/schedule' : '/doctors'}>
                  <Button size="lg">
                    {user?.role === 'DOCTOR' ? 'Manage My Schedule' : 'Find a Doctor Now'}
                  </Button>
                </Link>
              ) : (
                <Link href="/register">
                  <Button size="lg">Create Your Free Account</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">C</span>
              </div>
              <span className="text-lg font-semibold text-primary">CatoDoc</span>
            </div>
            <nav className="flex gap-6">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                About
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Terms
              </Link>
            </nav>
            <p className="text-sm text-muted-foreground">
              2026 CatoDoc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
