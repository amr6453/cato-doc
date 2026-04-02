'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, LogOut, User, Settings } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { getNavItemsByRole, getRoleDisplayName } from '@/lib/nav-config'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout, isLoading } = useAuth()

  const currentRole = user?.role || 'guest'
  const navItems = getNavItemsByRole(currentRole)

  const handleLogout = async () => {
    await logout()
    setOpen(false)
    router.push('/')
  }

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
    : ''

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="text-left">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">C</span>
              </div>
              <span className="text-xl font-bold text-primary">CatoDoc</span>
            </Link>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Navigation menu for CatoDoc
          </SheetDescription>
        </SheetHeader>

        <nav className="flex flex-col p-4">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <SheetClose asChild key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-secondary'
                  )}
                >
                  {item.label}
                </Link>
              </SheetClose>
            ))}
          </div>

          <div className="my-4 h-px bg-border" />

          {isAuthenticated && user ? (
            <div className="flex flex-col gap-4">
              {/* User info */}
              <div className="flex items-center gap-3 px-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={user.profile_picture}
                    alt={`${user.first_name} ${user.last_name}`}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {initials || <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {user.first_name} {user.last_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {getRoleDisplayName(user.role)}
                  </span>
                </div>
              </div>

              {/* User actions */}
              <div className="flex flex-col gap-1">
                <SheetClose asChild>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </SheetClose>
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 px-3">
              <SheetClose asChild>
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/register">
                  <Button className="w-full">Get Started</Button>
                </Link>
              </SheetClose>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
