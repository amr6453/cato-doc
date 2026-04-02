'use client'

import React, { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Camera, User, Phone, BookOpen, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { userApi, parseApiError } from '@/lib/api'
import { User as UserType } from '@/lib/types'

const profileSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters').optional().or(z.literal('')),
  last_name: z.string().min(2, 'Last name must be at least 2 characters').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional().or(z.literal('')),
  phone_number: z.string().regex(/^\+?[0-9\s-]{10,15}$/, 'Invalid phone number format').optional().or(z.literal('')),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface ProfileFormProps {
  user: UserType
  initialData?: any
  onSuccess?: () => void
}

export function ProfileForm({ user, initialData, onSuccess }: ProfileFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(user.image || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      bio: initialData?.bio || '',
      phone_number: initialData?.phone_number || '',
    },
  })

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 2MB",
          variant: "destructive",
        })
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (values: ProfileFormValues) => {
    setLoading(true)
    try {
      const formData = new FormData()
      if (values.first_name) formData.append('first_name', values.first_name)
      if (values.last_name) formData.append('last_name', values.last_name)
      if (user.role === 'DOCTOR' && values.bio) formData.append('bio', values.bio)
      if (user.role === 'PATIENT' && values.phone_number) formData.append('phone_number', values.phone_number)
      if (imageFile) formData.append('image', imageFile)

      await userApi.updateMe(formData)
      
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      })
      
      if (onSuccess) onSuccess()
    } catch (error) {
      const apiError = parseApiError(error)
      toast({
        title: "Update Failed",
        description: apiError.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative group">
            <Avatar className="w-32 h-32 border-4 border-white shadow-lg cursor-pointer transition-transform hover:scale-105" onClick={() => fileInputRef.current?.click()}>
              <AvatarImage src={imagePreview || ''} />
              <AvatarFallback className="bg-blue-50 text-[#001f3f] text-2xl font-bold">
                {user.first_name?.[0] || user.username[0].toUpperCase()}
              </AvatarFallback>
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white w-8 h-8" />
              </div>
            </Avatar>
            <Input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={onImageChange}
              accept="image/*"
            />
          </div>
          <p className="text-sm text-gray-500">Click to change profile picture</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#001f3f] font-semibold flex items-center gap-2">
                  <User className="w-4 h-4" /> First Name
                </FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} className="bg-gray-50/50 border-gray-200" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#001f3f] font-semibold flex items-center gap-2">
                  <User className="w-4 h-4" /> Last Name
                </FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} className="bg-gray-50/50 border-gray-200" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {user.role === 'DOCTOR' && (
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#001f3f] font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Professional Bio
                </FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell your patients about your experience..." 
                    className="min-h-[120px] bg-gray-50/50 border-gray-200 resize-none"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {user.role === 'PATIENT' && (
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#001f3f] font-semibold flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Phone Number
                </FormLabel>
                <FormControl>
                  <Input placeholder="+20 1XX XXX XXXX" {...field} className="bg-gray-50/50 border-gray-200" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button 
          type="submit" 
          className="w-full bg-[#001f3f] hover:bg-[#002f5f] h-12 text-lg font-bold shadow-lg transition-all"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-5 h-5 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
