import type { NavItem, UserRole } from './types'

// Navigation items with role-based access control
export const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    roles: ['PATIENT', 'DOCTOR', 'ADMIN'],
  },
  {
    label: 'Dashboard',
    href: '/dashboard/patient',
    roles: ['PATIENT'],
  },
  {
    label: 'Dashboard',
    href: '/dashboard/doctor',
    roles: ['DOCTOR'],
  },
  {
    label: 'Find Doctors',
    href: '/doctors',
    roles: ['PATIENT'],
  },
  {
    label: 'My Schedule',
    href: '/dashboard/doctor/schedule',
    roles: ['DOCTOR'],
  },
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    roles: ['ADMIN'],
  },
  {
    label: 'Manage Users',
    href: '/admin/users',
    roles: ['ADMIN'],
  },
  {
    label: 'Manage Doctors',
    href: '/admin/doctors',
    roles: ['ADMIN'],
  },
  {
    label: 'About',
    href: '/about',
    roles: ['PATIENT', 'DOCTOR', 'ADMIN'],
  },
  {
    label: 'Contact',
    href: '/contact',
    roles: ['PATIENT', 'DOCTOR', 'ADMIN'],
  },
]

// Filter navigation items by user role
export function getNavItemsByRole(role: UserRole): NavItem[] {
  // If guest, only show Home, About, Contact and Find Doctors
  if (role === 'GUEST') {
    return [
      { label: 'Home', href: '/', roles: ['GUEST'] },
      { label: 'Find Doctors', href: '/doctors', roles: ['GUEST'] },
      { label: 'About', href: '/about', roles: ['GUEST'] },
      { label: 'Contact', href: '/contact', roles: ['GUEST'] },
    ]
  }
  return navItems.filter((item) => item.roles.includes(role))
}

// Get role display name
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    GUEST: 'Guest',
    PATIENT: 'Patient',
    DOCTOR: 'Doctor',
    ADMIN: 'Administrator',
  }
  return roleNames[role]
}
