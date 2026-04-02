export interface Doctor {
  id: string
  name: string
  specialty: string
  rating: number
  price: number
  image: string
  bio: string
  location: string
  availability: string[]
}

export const mockDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiologist',
    rating: 4.8,
    price: 150,
    image: 'https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=200&h=200',
    bio: 'Experienced cardiologist with over 15 years in practice, specializing in preventive care and heart health.',
    location: 'New York, NY',
    availability: ['9:00 AM', '10:30 AM', '2:00 PM', '4:30 PM'],
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Dermatologist',
    rating: 4.9,
    price: 120,
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200',
    bio: 'Board-certified dermatologist focusing on skin cancer screening and advanced cosmetic procedures.',
    location: 'Los Angeles, CA',
    availability: ['11:00 AM', '1:00 PM', '3:30 PM'],
  },
  {
    id: '3',
    name: 'Dr. Emily Williams',
    specialty: 'Pediatrician',
    rating: 4.7,
    price: 100,
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200',
    bio: 'Dedicated pediatrician committed to providing compassionate care for children from infancy through adolescence.',
    location: 'Chicago, IL',
    availability: ['8:30 AM', '9:45 AM', '1:15 PM', '2:45 PM'],
  },
  {
    id: '4',
    name: 'Dr. James Wilson',
    specialty: 'Orthopedic Surgeon',
    rating: 4.6,
    price: 200,
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200',
    bio: 'Specialist in sports medicine and joint replacement surgery with a focus on minimally invasive techniques.',
    location: 'Houston, TX',
    availability: ['10:00 AM', '12:00 PM', '4:00 PM'],
  },
  {
    id: '5',
    name: 'Dr. Lisa Brown',
    specialty: 'Neurologist',
    rating: 4.9,
    price: 180,
    image: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=200&h=200',
    bio: 'Expert in treating complex neurological disorders, including migraines, epilepsy, and multiple sclerosis.',
    location: 'San Francisco, CA',
    availability: ['9:30 AM', '11:30 AM', '3:00 PM'],
  },
  {
    id: '6',
    name: 'Dr. Robert Martinez',
    specialty: 'General Practitioner',
    rating: 4.5,
    price: 90,
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200',
    bio: 'Passionate about family medicine and holistic health, providing comprehensive care for all ages.',
    location: 'Miami, FL',
    availability: ['8:00 AM', '10:00 AM', '12:30 PM', '3:30 PM'],
  },
]
