'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, Globe } from 'lucide-react'
import { useState } from 'react'

export default function ContactPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate submission
    setTimeout(() => {
      setLoading(false)
      toast({
        title: "Message Sent",
        description: "We've received your message and will get back to you soon.",
      })
    }, 1500)
  }

  return (
    <div className="container mx-auto px-4 py-16 space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl font-bold text-[#001f3f]">Get in Touch</h1>
        <p className="text-gray-500">
           Have questions or need assistance? Our support team is here to help you 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Contact Info */}
        <div className="space-y-8 lg:mt-8">
            {[
                { icon: Mail, label: 'Email Support', info: 'support@catodoc.com' },
                { icon: Phone, label: 'Call Us', info: '+1 (800) 123-4567' },
                { icon: MapPin, label: 'Headquarters', info: '123 Medical Plaza, San Francisco, CA' },
                { icon: Clock, label: 'Support Hours', info: '24/7 Monday - Sunday' },
            ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-[#001f3f] shrink-0">
                        <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-[#001f3f]">{item.label}</h3>
                        <p className="text-gray-600">{item.info}</p>
                    </div>
                </div>
            ))}
            
            <Card className="bg-[#001f3f] text-white p-6 border-none shadow-xl relative overflow-hidden">
                <Globe className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10" />
                <CardTitle className="text-lg mb-2">Connect Globally</CardTitle>
                <CardDescription className="text-blue-100/60 mb-6">
                    Our platform supports patients and doctors in over 50 countries.
                </CardDescription>
                <Button variant="outline" className="w-full bg-white/10 border-white/20 hover:bg-white/20 text-white">
                    View Office Locations
                </Button>
            </Card>
        </div>

        {/* Contact Form */}
        <Card className="lg:col-span-2 border-gray-100 shadow-xl p-8">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-2xl text-[#001f3f] flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-blue-500" />
                Send a Message
            </CardTitle>
            <CardDescription>Fill out the form below and we"ll respond within 24 hours.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input id="first-name" placeholder="John" required className="border-gray-200 h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input id="last-name" placeholder="Doe" required className="border-gray-200 h-11" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="john.doe@example.com" required className="border-gray-200 h-11" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="How can we help?" required className="border-gray-200 h-11" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Tell us more about your inquiry..." 
                  className="min-h-[150px] border-gray-200 resize-none py-3" 
                  required 
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-[#001f3f] hover:bg-[#001f3f]/90 transition-all font-bold text-lg"
                disabled={loading}
              >
                {loading ? 'Sending...' : (
                    <>
                        Send Message
                        <Send className="w-4 h-4 ml-2" />
                    </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
