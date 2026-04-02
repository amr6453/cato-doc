'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { getNavItemsByRole } from '@/lib/nav-config'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { UserMenu } from '@/components/user-menu'
import { MobileNav } from '@/components/mobile-nav'

export function Navbar() {
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading } = useAuth()

  // Hide Navbar for authenticated users as we use Sidebar there
  if (isAuthenticated && !pathname?.startsWith('/login') && !pathname?.startsWith('/register')) {
    return null
  }

  const currentRole = user?.role || 'GUEST'
  const navItems = getNavItemsByRole(currentRole)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="text-xl font-bold text-primary-foreground">C</span>
            </div>
            <span className="hidden text-xl font-bold text-primary sm:inline-block">
              CatoDoc
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Desktop auth buttons / user menu */}
          <div className="hidden md:flex md:items-center md:gap-2">
            {isLoading ? (
              <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
            ) : isAuthenticated ? (
              <UserMenu />
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile navigation */}
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
