'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Shield, Clock, Heart, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 space-y-20">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-100 px-4 py-1">Our Mission</Badge>
        <h1 className="text-4xl md:text-6xl font-bold text-[#001f3f] tracking-tight">
          Bringing Quality Healthcare to Your Fingertips
        </h1>
        <p className="text-xl text-gray-500 leading-relaxed">
          CatoDoc is dedicated to connecting patients with the best medical professionals through a seamless, secure, and modern platform.
        </p>
        <div className="flex justify-center gap-4 pt-4">
            <Button asChild size="lg" className="bg-[#001f3f] h-12 px-8">
                <Link href="/doctors">Find a Doctor</Link>
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8 border-[#001f3f] text-[#001f3f] hover:bg-[#001f3f]/5">
                Learn More
            </Button>
        </div>
      </section>

      {/* Values */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { icon: Shield, title: 'Secure & Private', desc: 'Your medical data is encrypted and protected with industry-leading security.' },
          { icon: Users, title: 'Expert Doctors', desc: 'We pre-vet every medical professional on our platform for your peace of mind.' },
          { icon: Clock, title: 'Instant Booking', desc: 'Skip the wait times with our 24/7 real-time appointment scheduling system.' },
          { icon: Heart, title: 'Patient Centered', desc: 'Our platform is designed around the needs and comfort of our patients.' },
        ].map((item, i) => (
          <Card key={i} className="border-none shadow-sm bg-gray-50/50 p-6 space-y-4 hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 rounded-lg bg-[#001f3f] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <item.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#001f3f]">{item.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
          </Card>
        ))}
      </section>

      {/* Stats Section */}
      <section className="bg-[#001f3f] rounded-3xl p-12 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center relative z-10">
              <div className="space-y-2">
                  <div className="text-4xl md:text-5xl font-bold">10k+</div>
                  <div className="text-blue-100 text-sm">Active Patients</div>
              </div>
              <div className="space-y-2">
                  <div className="text-4xl md:text-5xl font-bold">500+</div>
                  <div className="text-blue-100 text-sm">Expert Doctors</div>
              </div>
              <div className="space-y-2">
                  <div className="text-4xl md:text-5xl font-bold">20+</div>
                  <div className="text-blue-100 text-sm">Specialties</div>
              </div>
              <div className="space-y-2">
                  <div className="text-4xl md:text-5xl font-bold">4.9/5</div>
                  <div className="text-blue-100 text-sm">Patient Rating</div>
              </div>
          </div>
      </section>

      {/* Team/Story Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
          <Image
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800"
            alt="Medical Team"
            fill
            className="object-cover"
          />
        </div>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-[#001f3f]">Our Story</h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            Founded in 2024, CatoDoc emerged from a simple observation: scheduling a medical appointment should be as easy as booking a hotel. We saw the frustration patients faced with long wait times and fragmented systems, and we decided to build a better way.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Today, were proud to facilitate thousands of appointments every month, helping people get the care they need, when they need it. Our team of healthcare experts and software engineers works tirelessly to improve the platform and expand our network of trusted providers.
          </p>
          <Button variant="link" className="text-[#001f3f] p-0 h-auto font-bold flex items-center gap-2 group">
            Our commitment to quality <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>
    </div>
  )
}
