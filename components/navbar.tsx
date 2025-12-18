'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const menuRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Check if user is signed in
  useEffect(() => {
    // Get initial session synchronously from local storage
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
      }
      setIsInitialLoad(false)
    }

    getInitialSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[hsl(var(--bg-primary))] backdrop-blur-xl">
      <div className="container-centered">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-9 h-9 flex-shrink-0">
              <Image
                src="/Vorg.png"
                alt="Vorg Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold tracking-tighter">VORG</span>
          </Link>

          {/* Center Navigation - Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/docs"
              className="text-sm text-foreground-secondary hover:text-foreground transition-colors relative group"
            >
              Docs
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-foreground-secondary hover:text-foreground transition-colors relative group"
            >
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>

          {/* Right Side - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {isInitialLoad ? (
              // Loading skeleton
              <div className="flex items-center gap-4">
                <div className="w-16 h-4 bg-gray-700 rounded animate-pulse" />
                <div className="w-24 h-10 bg-gray-700 rounded-lg animate-pulse" />
              </div>
            ) : user ? (
              <Button
                asChild
                className="bg-blue-600 text-white hover:bg-blue-700 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all"
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Button
                  asChild
                  className="bg-blue-600 text-white hover:bg-blue-700 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all"
                >
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Hamburger Menu Button - Mobile */}
          <div className="md:hidden relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center justify-center w-10 h-10 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-all"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Plus className="w-6 h-6" />
              )}
            </button>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
              <div className="absolute right-0 top-14 w-56 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-color))] rounded-xl shadow-2xl overflow-hidden">
                <div className="py-2">
                  {/* Show user info if logged in */}
                  {user && (
                    <>
                      <div className="px-4 py-3 border-b border-[hsl(var(--border-color))]">
                        <p className="text-xs text-[hsl(var(--text-secondary))]">Signed in as</p>
                        <p className="text-sm text-[hsl(var(--text-primary))] font-medium truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center px-4 py-3 text-sm text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors font-semibold"
                      >
                        Dashboard
                      </Link>
                      <div className="border-t border-[hsl(var(--border-color))] my-2"></div>
                    </>
                  )}

                  <Link
                    href="/docs"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-4 py-3 text-sm text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
                  >
                    Docs
                  </Link>
                  <Link
                    href="/pricing"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-4 py-3 text-sm text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
                  >
                    Pricing
                  </Link>

                  {isInitialLoad ? (
                    <div className="px-4 py-3 border-t border-[hsl(var(--border-color))] mt-2">
                      <div className="w-24 h-4 bg-gray-700 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  ) : !user ? (
                    <>
                      <div className="border-t border-[hsl(var(--border-color))] my-2"></div>
                      <Link
                        href="/auth/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center px-4 py-3 text-sm text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/auth/signup"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center px-4 py-3 text-sm text-blue-600 hover:bg-[hsl(var(--bg-tertiary))] transition-colors font-semibold"
                      >
                        Get Started
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="border-t border-[hsl(var(--border-color))] my-2"></div>
                      <Link
                        href="/auth/signout"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center px-4 py-3 text-sm text-red-500 hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
                      >
                        Sign Out
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
