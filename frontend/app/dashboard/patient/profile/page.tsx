'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { User, Mail, Phone, Calendar, Heart, Activity, Thermometer, Droplets, ShieldCheck, AlertCircle, FileText } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function PatientProfile() {
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8 space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#001f3f] tracking-tight">Health Profile</h1>
          <p className="text-gray-500 mt-1 font-medium">Your medical passport and vital health history.</p>
        </div>
        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 px-4 py-1.5 rounded-full flex items-center gap-2 group cursor-help transition-all hover:bg-emerald-100">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-bold">Verified Medical Record</span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-10">
            {/* Personal Vitals */}
            <Card className="border-none shadow-2xl shadow-blue-900/5 bg-white overflow-hidden rounded-[40px]">
                <CardHeader className="bg-[#001f3f] text-white p-10 pb-16 relative">
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="flex items-center gap-6 relative">
                        <div className="w-24 h-24 rounded-[32px] bg-white p-1 shadow-2xl">
                            <div className="w-full h-full rounded-[28px] bg-blue-50 flex items-center justify-center text-3xl font-black text-[#001f3f] border border-blue-100">
                                {user?.username?.substring(0, 2).toUpperCase()}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-3xl font-black">{user?.first_name} {user?.last_name || user?.username}</CardTitle>
                            <div className="flex gap-4 opacity-70 font-bold text-sm">
                                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {user?.email}</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-10 -mt-10 relative">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        {[
                            { label: 'Blood Type', value: 'O+', icon: Droplets, color: 'rose' },
                            { label: 'Height', value: '178 cm', icon: Activity, color: 'blue' },
                            { label: 'Weight', value: '74 kg', icon: Thermometer, color: 'orange' },
                            { label: 'Age', value: '29 yrs', icon: Calendar, color: 'emerald' },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-white p-6 rounded-[32px] shadow-xl shadow-gray-200/50 border border-slate-50 flex flex-col items-center text-center group hover:scale-105 transition-all duration-300">
                                <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center mb-4 shadow-inner`}>
                                    <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                                <p className="text-xl font-black text-[#001f3f]">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Medical History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <Card className="border-none shadow-2xl shadow-blue-900/5 bg-white rounded-[40px] p-10 space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-rose-500" />
                        </div>
                        <h3 className="text-xl font-black text-[#001f3f]">Allergies</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {['Peanuts', 'Penicillin', 'Dust Mites'].map(tag => (
                            <Badge key={tag} className="bg-rose-50 text-rose-700 border-none font-bold px-4 py-1.5 rounded-xl">{tag}</Badge>
                        ))}
                        <button className="text-xs font-black text-rose-600 hover:underline ml-2">+ Add New</button>
                    </div>
                </Card>

                <Card className="border-none shadow-2xl shadow-blue-900/5 bg-white rounded-[40px] p-10 space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-black text-[#001f3f]">Conditions</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {['Asthma', 'Mild Hypertension'].map(tag => (
                            <Badge key={tag} className="bg-blue-50 text-blue-700 border-none font-bold px-4 py-1.5 rounded-xl">{tag}</Badge>
                        ))}
                    </div>
                </Card>
            </div>
        </div>

        <div className="space-y-10">
             <Card className="border-none shadow-2xl shadow-gray-200/50 bg-[#001f3f] text-white p-10 rounded-[40px] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 blur-2xl group-hover:scale-110 transition-transform" />
                <div className="relative space-y-6">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md">
                        <Heart className="h-6 w-6 text-rose-400" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black tracking-tight mb-2">Insurance Status</h3>
                        <p className="text-blue-100/60 font-medium italic text-sm">Synchronized with <span className="text-white font-black italic underline">MetLife Premium</span></p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-bold opacity-60">Policy Number</span>
                            <span className="font-black italic">MTL-882291</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-bold opacity-60">Status</span>
                            <Badge className="bg-emerald-500 text-white border-none font-black text-[10px]">ACTIVE</Badge>
                        </div>
                    </div>
                    <Button variant="secondary" className="w-full bg-white text-[#001f3f] hover:bg-white/90 font-black h-12 rounded-2xl shadow-lg">
                        Update Card
                    </Button>
                </div>
            </Card>

            <Card className="border-none shadow-2xl shadow-gray-200/50 bg-white p-10 rounded-[40px] space-y-6">
                <h3 className="text-lg font-black text-[#001f3f]">Privacy Controls</h3>
                <p className="text-xs text-gray-400 font-bold leading-relaxed italic">Your health data is protected by AES-256 encryption. Only authorized medical professionals can view your records during active consultations.</p>
                <div className="pt-2">
                    <button className="text-sm font-black text-blue-600 hover:text-blue-700">Manage Permissions &rarr;</button>
                </div>
            </Card>
        </div>
      </div>
    </div>
  )
}
