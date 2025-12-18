'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { getUserProjects, getRecentlyViewedProjects, deleteProject, type Project } from '@/lib/projects'
import { StarsBackground } from '@/components/shooting-stars'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { ArrowRight, Plus, Trash2, X, Sun, Moon, User, CreditCard, Zap, LogOut } from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

export default function DashboardPage() {
  const [prompt, setPrompt] = useState('')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [activeView, setActiveView] = useState<'recent' | 'all'>('recent')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false)
  const [userPlan, setUserPlan] = useState<string>('free')
  const [generationsUsed, setGenerationsUsed] = useState<number>(0)
  const [generationLimit, setGenerationLimit] = useState<number>(3)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const avatarMenuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        router.push('/auth/login')
        return
      }

      setUser(user)

      // Fetch user's subscription plan and usage
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan, generations_used, generation_limit')
        .eq('user_id', user.id)
        .single()

      if (subscription?.plan) {
        setUserPlan(subscription.plan)
        setGenerationsUsed(subscription.generations_used || 0)
        setGenerationLimit(subscription.generation_limit || 3)
      }

      // Fetch user's projects
      const [allProjects, recent] = await Promise.all([
        getUserProjects(),
        getRecentlyViewedProjects()
      ])

      setProjects(allProjects)
      setRecentProjects(recent)
      setLoading(false)
    }

    checkUser()
  }, [router, supabase])

  // Refresh projects when the window gains focus (user returns to dashboard)
  useEffect(() => {
    const refreshProjects = async () => {
      const [allProjects, recent] = await Promise.all([
        getUserProjects(),
        getRecentlyViewedProjects()
      ])

      setProjects(allProjects)
      setRecentProjects(recent)
    }

    window.addEventListener('focus', refreshProjects)
    return () => window.removeEventListener('focus', refreshProjects)
  }, [])

  // Close avatar menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target as Node)) {
        setIsAvatarMenuOpen(false)
      }
    }

    if (isAvatarMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isAvatarMenuOpen])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setUploadedImage(reader.result as string)
    }
    reader.onerror = () => {
      alert('Failed to read image file')
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setUploadedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handlePlusClick = () => {
    fileInputRef.current?.click()
  }

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    // Pass prompt to generate page via URL params
    router.push(`/generate?prompt=${encodeURIComponent(prompt)}`)
  }

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation to project
    e.stopPropagation() // Stop event bubbling

    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }

    const success = await deleteProject(projectId)

    if (success) {
      // Refresh projects list
      const [allProjects, recent] = await Promise.all([
        getUserProjects(),
        getRecentlyViewedProjects()
      ])
      setProjects(allProjects)
      setRecentProjects(recent)
    } else {
      alert('Failed to delete project. Please try again.')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) {
      return `${diffInHours} hours ago`
    } else if (diffInHours < 48) {
      return 'yesterday'
    } else {
      const days = Math.floor(diffInHours / 24)
      return `${days} days ago`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-primary))] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <Image
              src="/Vorg.png"
              alt="Vorg Logo"
              fill
              className="object-contain animate-pulse"
              priority
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-[hsl(var(--text-secondary))] text-sm mt-2">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[hsl(var(--bg-primary))] flex overflow-hidden">
      {/* Mobile Header - Only visible on mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[hsl(var(--bg-primary))]/30 backdrop-blur-md border-b border-[hsl(var(--border-color))] h-14">
        <div className="flex items-center justify-between px-4 h-full">
          {/* Left: Menu button + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
            >
              <svg
                className="w-5 h-5 text-[hsl(var(--text-primary))]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="relative w-7 h-7">
                <Image
                  src="/Vorg.png"
                  alt="Vorg Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-[hsl(var(--text-primary))] font-semibold text-sm">VORG</span>
            </div>
          </div>

          {/* Right: User Avatar with Dropdown */}
          <div className="relative" ref={avatarMenuRef}>
            <button
              onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center hover:scale-105 transition-transform"
            >
              <span className="text-white text-xs font-semibold">
                {user?.email?.[0].toUpperCase() || 'U'}
              </span>
            </button>

            {/* Dropdown Menu */}
            {isAvatarMenuOpen && (
              <div className="absolute right-0 top-12 w-64 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-color))] rounded-xl shadow-2xl overflow-hidden">
                <div className="py-2">
                  {/* User Info with Plan Badge */}
                  <div className="px-4 py-3 border-b border-[hsl(var(--border-color))]">
                    <p className="text-sm text-[hsl(var(--text-primary))] font-medium truncate mb-1">
                      {user?.email}
                    </p>
                    <p className="text-xs text-[hsl(var(--text-secondary))] capitalize">
                      {userPlan === 'free' ? 'Free Plan' : `${userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} Plan`}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <button
                    onClick={() => {
                      toggleTheme()
                      setIsAvatarMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    Light Mode
                  </button>
                  <Link
                    href="/account"
                    onClick={() => setIsAvatarMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Account Settings
                  </Link>
                  <Link
                    href="/pricing"
                    onClick={() => setIsAvatarMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
                  >
                    <CreditCard className="w-4 h-4" />
                    Billing
                  </Link>
                  <Link
                    href="/pricing"
                    onClick={() => setIsAvatarMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                    Upgrade Plan
                  </Link>

                  <div className="border-t border-[hsl(var(--border-color))] my-2"></div>

                  <Link
                    href="/auth/signout"
                    onClick={() => setIsAvatarMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar - Fixed */}
      <DashboardSidebar
        user={user}
        projects={projects}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={setIsSidebarCollapsed}
      />

      {/* Main Content Area - Scrollable with hidden scrollbar */}
      <main className={`flex-1 h-screen overflow-y-auto relative scrollbar-hide transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-0 md:ml-16' : 'ml-0 md:ml-64'
      } pt-14 md:pt-0`}>
        <style jsx>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Background Effects - Starry background for entire main section */}
        <div className="absolute inset-0 bg-[hsl(var(--bg-primary))]">
          <StarsBackground />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--bg-primary))] via-transparent to-[hsl(var(--bg-primary))]" />
        </div>

        {/* Content Container */}
        <div className="relative z-10">
          {/* Top Section - Centered Input */}
          <div className="flex items-center justify-center min-h-[70vh] px-3 md:px-4 py-4 md:py-8 pt-24">
            <div className="w-full max-w-3xl mx-auto">
              {/* Main Input Section */}
              <div className="text-center mb-6 sm:mb-8 px-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-[hsl(var(--text-primary))]">
                  Create Your Landing Page
                </h1>
                <p className="text-base sm:text-lg text-[hsl(var(--text-secondary))] mb-4">
                  Describe your vision and let AI build it for you
                </p>
                {/* Generation Counter */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-color))] rounded-full">
                  <span className="text-sm text-[hsl(var(--text-secondary))]">
                    {generationsUsed} / {generationLimit === 999999 ? '∞' : generationLimit} projects this month
                  </span>
                  {generationLimit < 999999 && (
                    <Link
                      href="/pricing"
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Upgrade
                    </Link>
                  )}
                </div>
              </div>

              {/* Input Box */}
              <form onSubmit={handleGenerate} className="mb-8">
                <div className="relative bg-[hsl(var(--bg-primary))] backdrop-blur-md border border-[hsl(var(--border-color))] rounded-xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:border-[hsl(var(--border-hover))] transition-all">
                  {/* Image Preview */}
                  {uploadedImage && (
                    <div className="relative mb-2 inline-block">
                      <img
                        src={uploadedImage}
                        alt="Upload preview"
                        className="w-16 h-16 object-cover rounded-lg border border-[hsl(var(--border-color))]"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleGenerate(e)
                      }
                    }}
                    placeholder="Describe the landing page you want to build..."
                    className="w-full bg-transparent px-0 py-1 text-base resize-none outline-none placeholder:text-[hsl(var(--text-tertiary))] placeholder:text-left text-left min-h-[60px] max-h-[240px] mb-2 text-[hsl(var(--text-primary))]"
                    rows={2}
                  />
                  <div className="flex items-center justify-between">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={handlePlusClick}
                      className="flex-shrink-0 flex items-center justify-center w-9 h-9 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-color))] rounded-lg transition-all"
                      title="Upload reference image"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    <button
                      type="submit"
                      disabled={!prompt.trim()}
                      className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Projects Section - Theme-aware Background with Rounded Corners */}
          <div className="px-6 md:px-8 pb-32">
            <div className="bg-[hsl(var(--bg-secondary))] rounded-3xl p-4 sm:p-6 md:p-12 min-h-screen border border-[hsl(var(--border-color))]">
              {/* Section Header - Always visible */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto">
                  <button
                    onClick={() => setActiveView('recent')}
                    className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                      activeView === 'recent'
                        ? 'bg-blue-600 text-white'
                        : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]'
                    }`}
                  >
                    Recently viewed
                  </button>
                  <button
                    onClick={() => setActiveView('all')}
                    className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                      activeView === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))]'
                    }`}
                  >
                    My projects
                  </button>
                </div>
              </div>

              {(activeView === 'recent' ? recentProjects : projects).length > 0 ? (
                <>
                  {/* Projects Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(activeView === 'recent' ? recentProjects : projects).map((project) => (
                      <Link
                        key={project.id}
                        href={`/generate?id=${project.id}`}
                        className="group"
                      >
                        <div className="bg-[hsl(var(--bg-tertiary))] rounded-xl overflow-hidden border border-[hsl(var(--border-color))] hover:border-blue-400 hover:shadow-lg transition-all relative">
                          {/* Delete Button */}
                          <button
                            onClick={(e) => handleDeleteProject(project.id, e)}
                            className="absolute top-2 right-2 z-10 w-8 h-8 bg-red-500/90 hover:bg-red-600 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete project"
                          >
                            <Trash2 className="w-4 h-4 text-[hsl(var(--text-primary))]" />
                          </button>

                          {/* Project Thumbnail - Desktop-First Lovable Style */}
                          <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                            <div className="absolute inset-0 overflow-hidden rounded-t-xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900">
                              {project.html_content ? (
                                <>
                                  {/* Desktop viewport preview - fixed 1280x800, cropped to hero section */}
                                  <div
                                    className="absolute inset-0"
                                    style={{
                                      overflow: 'hidden',
                                    }}
                                  >
                                    <iframe
                                      srcDoc={project.html_content}
                                      sandbox="allow-scripts allow-same-origin"
                                      className="border-0 pointer-events-none origin-top-left transition-transform duration-300 group-hover:scale-[1.03]"
                                      style={{
                                        width: '1280px',
                                        height: '800px',
                                        minWidth: '1280px',
                                        minHeight: '800px',
                                        transform: 'scale(0.31)',
                                        transformOrigin: 'top center',
                                        position: 'absolute',
                                        top: '0',
                                        left: '50%',
                                        marginLeft: '-640px', // Center the 1280px width
                                      }}
                                      title={`Preview of ${project.name}`}
                                    />
                                  </div>
                                  {/* Premium overlay on hover */}
                                  <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/0 group-hover:to-black/5 transition-all duration-300 pointer-events-none" />
                                </>
                              ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                  <span className="text-gray-500 text-xs">No preview</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Project Info */}
                          <div className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-semibold">
                                  {user?.email?.[0].toUpperCase() || 'U'}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-[hsl(var(--text-primary))] font-medium truncate group-hover:text-blue-600 transition-colors">
                                  {project.name || 'Untitled Project'}
                                </h3>
                                <p className="text-[hsl(var(--text-secondary))] text-sm">
                                  Viewed {formatDate(project.last_viewed_at)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                /* Empty State */
                <div className="text-center py-12">
                  <p className="text-[hsl(var(--text-secondary))] text-sm">
                    No projects yet — start building your first landing page above.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
