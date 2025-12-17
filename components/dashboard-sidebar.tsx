'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AccountSettingsModal } from '@/components/account-settings-modal'
import { BillingModal } from '@/components/billing-modal'
import { SubscriptionStatus } from '@/components/subscription-status'
import { getUserSubscription } from '@/lib/subscription'
import { useTheme } from '@/contexts/theme-context'
import {
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  FolderOpen,
  User,
  CreditCard,
  LogOut,
  Settings,
  Moon,
  Sun,
} from 'lucide-react'

interface DashboardSidebarProps {
  user: any
  projects: any[]
  isCollapsed: boolean
  onToggleCollapse: (collapsed: boolean) => void
}

export function DashboardSidebar({ user, projects, isCollapsed, onToggleCollapse }: DashboardSidebarProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false)
  const [userPlan, setUserPlan] = useState<string>('free')
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    // Check if mobile on mount
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        onToggleCollapse(true)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [onToggleCollapse])

  useEffect(() => {
    // Load user's subscription plan
    const loadUserPlan = async () => {
      const subscription = await getUserSubscription()
      if (subscription) {
        setUserPlan(subscription.plan)
      }
    }

    loadUserPlan()

    // Poll for subscription updates after successful payment
    if (typeof window !== 'undefined' && window.location.search.includes('success=true')) {
      let attempts = 0
      const maxAttempts = 15

      const pollPlan = async () => {
        const subscription = await getUserSubscription()

        if (subscription && subscription.plan !== 'free') {
          setUserPlan(subscription.plan)
          return
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(pollPlan, 2000)
        }
      }

      setTimeout(pollPlan, 2000)
    }

    // Refresh plan when window gains focus (after payment)
    window.addEventListener('focus', loadUserPlan)
    return () => window.removeEventListener('focus', loadUserPlan)
  }, [])

  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleLinkClick = () => {
    // Auto-expand sidebar when clicking any link
    if (isCollapsed) {
      onToggleCollapse(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-[hsl(var(--bg-secondary))] transition-all duration-300 ease-in-out z-50 border-r border-[hsl(var(--border-color))] ${
          isCollapsed ? '-translate-x-full md:translate-x-0 md:w-16' : 'translate-x-0 w-64'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header with Logo and Collapse Button */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border-color))]">
            <Link
              href="/dashboard"
              onClick={handleLinkClick}
              className={`flex items-center gap-2 transition-all duration-300 ${
                isCollapsed ? 'justify-center w-full' : ''
              }`}
            >
              <div className="relative w-9 h-9 flex-shrink-0">
                <Image
                  src="/Vorg.png"
                  alt="Vorg Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              {!isCollapsed && (
                <span className="text-[hsl(var(--text-primary))] font-semibold text-sm whitespace-nowrap">
                  VORG
                </span>
              )}
            </Link>

            {/* Collapse Toggle Button - Next to Logo */}
            {!isCollapsed && (
              <button
                onClick={() => onToggleCollapse(!isCollapsed)}
                className="w-6 h-6 bg-[hsl(var(--bg-tertiary))] hover:bg-[hsl(var(--hover-bg))] border border-[hsl(var(--border-color))] rounded-md flex items-center justify-center transition-colors flex-shrink-0"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-[hsl(var(--text-secondary))]" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {/* Create New Project */}
            <Link
              href="/generate"
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-all duration-200 group ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <PlusCircle className="w-5 h-5 text-[hsl(var(--text-secondary))] group-hover:text-[hsl(var(--text-primary))] flex-shrink-0 transition-colors" />
              <span
                className={`text-[hsl(var(--text-primary))] group-hover:text-[hsl(var(--text-primary))] text-sm whitespace-nowrap transition-all duration-300 ${
                  isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'
                }`}
              >
                Create Project
              </span>
            </Link>

            {/* Section Divider - Projects */}
            {!isCollapsed && (
              <div className="pt-4 pb-2">
                <p className="px-3 text-xs font-medium text-[hsl(var(--text-secondary))] uppercase tracking-wider">
                  Projects
                </p>
              </div>
            )}

            {/* My Projects */}
            <Link
              href="/projects"
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-all duration-200 group ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <FolderOpen className="w-5 h-5 text-[hsl(var(--text-secondary))] group-hover:text-[hsl(var(--text-primary))] flex-shrink-0 transition-colors" />
              <span
                className={`text-[hsl(var(--text-primary))] group-hover:text-[hsl(var(--text-primary))] text-sm whitespace-nowrap transition-all duration-300 ${
                  isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'
                }`}
              >
                All Projects
              </span>
            </Link>

            {/* Project List */}
            {!isCollapsed && projects.length > 0 && (
              <div className="ml-6 mt-1 space-y-0.5 max-h-48 overflow-y-auto">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/generate?id=${project.id}`}
                    onClick={handleLinkClick}
                    className="block px-3 py-2 rounded-md hover:bg-[hsl(var(--bg-tertiary))] transition-colors group"
                  >
                    <div className="text-[hsl(var(--text-secondary))] text-xs truncate group-hover:text-[hsl(var(--text-primary))]">
                      {project.name || 'Untitled Project'}
                    </div>
                    <div className="text-[hsl(var(--text-secondary))] text-[10px] mt-0.5">
                      {formatDate(project.created_at)}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Section Divider - Settings */}
            {!isCollapsed && (
              <div className="pt-4 pb-2">
                <p className="px-3 text-xs font-medium text-[hsl(var(--text-secondary))] uppercase tracking-wider">
                  Settings
                </p>
              </div>
            )}

            {/* Account */}
            <button
              onClick={() => {
                setIsAccountModalOpen(true)
                handleLinkClick()
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-all duration-200 group w-full ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <User className="w-5 h-5 text-[hsl(var(--text-secondary))] group-hover:text-[hsl(var(--text-primary))] flex-shrink-0 transition-colors" />
              <span
                className={`text-[hsl(var(--text-primary))] group-hover:text-[hsl(var(--text-primary))] text-sm whitespace-nowrap transition-all duration-300 ${
                  isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'
                }`}
              >
                Account
              </span>
            </button>

            {/* Billing */}
            <button
              onClick={() => {
                setIsBillingModalOpen(true)
                handleLinkClick()
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-all duration-200 group w-full ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <CreditCard className="w-5 h-5 text-[hsl(var(--text-secondary))] group-hover:text-[hsl(var(--text-primary))] flex-shrink-0 transition-colors" />
              <span
                className={`text-[hsl(var(--text-primary))] group-hover:text-[hsl(var(--text-primary))] text-sm whitespace-nowrap transition-all duration-300 ${
                  isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'
                }`}
              >
                Billing
              </span>
            </button>
          </nav>

          {/* Subscription Status */}
          {!isCollapsed && (
            <div className="px-3 pb-3">
              <SubscriptionStatus onUpgradeClick={() => setIsBillingModalOpen(true)} />
            </div>
          )}

          {/* User Avatar & Menu */}
          <div className="p-3 relative border-t border-white/5" ref={menuRef}>
            {/* Avatar Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[hsl(var(--bg-tertiary))] transition-colors w-full text-left group ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-[hsl(var(--text-primary))] text-xs font-semibold">
                  {user?.email?.[0].toUpperCase() || 'U'}
                </span>
              </div>

              {/* User Info */}
              {!isCollapsed && user && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[hsl(var(--text-primary))] truncate font-medium">{user.email?.split('@')[0]}</p>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">
                    {userPlan === 'free' ? 'Free Plan' : `${userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} Plan`}
                  </p>
                </div>
              )}
            </button>

            {/* Popup Menu */}
            {isMenuOpen && !isCollapsed && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-color))] rounded-lg shadow-2xl overflow-hidden">
                <div className="p-3 border-b border-[hsl(var(--border-color))]">
                  <p className="text-sm text-[hsl(var(--text-primary))] font-medium truncate">{user?.email}</p>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">
                    {userPlan === 'free' ? 'Free Plan' : `${userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} Plan`}
                  </p>
                </div>

                <div className="py-2">
                  <button
                    onClick={() => {
                      toggleTheme()
                    }}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-[hsl(var(--bg-tertiary))] transition-colors w-full text-left"
                  >
                    {theme === 'dark' ? (
                      <Sun className="w-4 h-4 text-[hsl(var(--text-secondary))]" />
                    ) : (
                      <Moon className="w-4 h-4 text-[hsl(var(--text-secondary))]" />
                    )}
                    <span className="text-sm text-[hsl(var(--text-primary))]">
                      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      setIsAccountModalOpen(true)
                    }}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-[hsl(var(--bg-tertiary))] transition-colors w-full text-left"
                  >
                    <User className="w-4 h-4 text-[hsl(var(--text-secondary))]" />
                    <span className="text-sm text-[hsl(var(--text-primary))]">Account Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      setIsBillingModalOpen(true)
                    }}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-[hsl(var(--bg-tertiary))] transition-colors w-full text-left"
                  >
                    <CreditCard className="w-4 h-4 text-[hsl(var(--text-secondary))]" />
                    <span className="text-sm text-[hsl(var(--text-primary))]">Billing</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      setIsBillingModalOpen(true)
                    }}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-[hsl(var(--bg-tertiary))] transition-colors w-full text-left"
                  >
                    <Settings className="w-4 h-4 text-[hsl(var(--text-secondary))]" />
                    <span className="text-sm text-[hsl(var(--text-primary))]">Upgrade Plan</span>
                  </button>
                </div>

                <div className="border-t border-[hsl(var(--border-color))]">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      handleSignOut()
                    }}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-[hsl(var(--bg-tertiary))] transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4 text-[hsl(var(--text-secondary))]" />
                    <span className="text-sm text-[hsl(var(--text-primary))]">Sign Out</span>
                  </button>
                </div>
              </div>
            )}

            {/* Icon-only popup for collapsed state */}
            {isMenuOpen && isCollapsed && (
              <div className="absolute bottom-full left-16 mb-2 w-48 bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-color))] rounded-lg shadow-2xl overflow-hidden">
                <div className="p-3 border-b border-[hsl(var(--border-color))]">
                  <p className="text-sm text-[hsl(var(--text-primary))] font-medium truncate">{user?.email}</p>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">
                    {userPlan === 'free' ? 'Free Plan' : `${userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} Plan`}
                  </p>
                </div>

                <div className="py-2">
                  <button
                    onClick={() => {
                      toggleTheme()
                    }}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-[hsl(var(--bg-tertiary))] transition-colors w-full text-left"
                  >
                    {theme === 'dark' ? (
                      <Sun className="w-4 h-4 text-[hsl(var(--text-secondary))]" />
                    ) : (
                      <Moon className="w-4 h-4 text-[hsl(var(--text-secondary))]" />
                    )}
                    <span className="text-sm text-[hsl(var(--text-primary))]">
                      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      setIsAccountModalOpen(true)
                    }}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-[hsl(var(--bg-tertiary))] transition-colors w-full text-left"
                  >
                    <User className="w-4 h-4 text-[hsl(var(--text-secondary))]" />
                    <span className="text-sm text-[hsl(var(--text-primary))]">Account Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      setIsBillingModalOpen(true)
                    }}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-[hsl(var(--bg-tertiary))] transition-colors w-full text-left"
                  >
                    <CreditCard className="w-4 h-4 text-[hsl(var(--text-secondary))]" />
                    <span className="text-sm text-[hsl(var(--text-primary))]">Billing</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      setIsBillingModalOpen(true)
                    }}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-[hsl(var(--bg-tertiary))] transition-colors w-full text-left"
                  >
                    <Settings className="w-4 h-4 text-[hsl(var(--text-secondary))]" />
                    <span className="text-sm text-[hsl(var(--text-primary))]">Upgrade Plan</span>
                  </button>
                </div>

                <div className="border-t border-[hsl(var(--border-color))]">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      handleSignOut()
                    }}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-[hsl(var(--bg-tertiary))] transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4 text-[hsl(var(--text-secondary))]" />
                    <span className="text-sm text-[hsl(var(--text-primary))]">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {!isCollapsed && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => onToggleCollapse(true)}
        />
      )}

      {/* Account Settings Modal */}
      <AccountSettingsModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onOpenBilling={() => setIsBillingModalOpen(true)}
        user={user}
      />

      {/* Billing Modal */}
      <BillingModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        user={user}
      />
    </>
  )
}
