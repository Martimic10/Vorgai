'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { getUserProjects, deleteProject, type Project } from '@/lib/projects'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { Trash2, ChevronDown } from 'lucide-react'

type SortOption = 'last_edited' | 'name' | 'created'

export default function ProjectsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('last_edited')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        router.push('/auth/login')
        return
      }

      setUser(user)

      // Fetch user's projects
      const allProjects = await getUserProjects()
      setProjects(allProjects)
      setLoading(false)
    }

    checkUser()
  }, [router, supabase])

  // Refresh projects when the window gains focus
  useEffect(() => {
    const refreshProjects = async () => {
      const allProjects = await getUserProjects()
      setProjects(allProjects)
    }

    window.addEventListener('focus', refreshProjects)
    return () => window.removeEventListener('focus', refreshProjects)
  }, [])

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm('Are you sure you want to delete this project?')) {
      return
    }

    await deleteProject(projectId)
    setProjects(projects.filter(p => p.id !== projectId))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return 'just now'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} ${days === 1 ? 'day' : 'days'} ago`
    }
  }

  const getSortedProjects = () => {
    const sorted = [...projects]
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'created':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case 'last_edited':
      default:
        return sorted.sort((a, b) => new Date(b.last_viewed_at).getTime() - new Date(a.last_viewed_at).getTime())
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
          <p className="text-[hsl(var(--text-secondary))] text-sm mt-2">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[hsl(var(--bg-secondary))] flex overflow-hidden">
      {/* Mobile Header - Only visible on mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-[hsl(var(--bg-primary))] border-b border-[hsl(var(--border-color))] flex items-center justify-between px-4">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="relative w-8 h-8">
              <Image
                src="/Vorg.png"
                alt="Vorg Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-[hsl(var(--text-primary))] font-semibold text-sm">VORG</span>
          </Link>
        </div>

        {/* Right: User Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-[hsl(var(--text-primary))] text-xs font-semibold">
            {user?.email?.[0].toUpperCase() || 'U'}
          </span>
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

        {/* Background - Theme Aware */}
        <div className="absolute inset-0 bg-[hsl(var(--bg-primary))]" />

        {/* Content Container */}
        <div className="relative z-10 px-6 md:px-8 py-8">
          <div className="bg-[hsl(var(--bg-secondary))] rounded-3xl p-6 md:p-12 min-h-screen border border-[hsl(var(--border-color))]">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-[hsl(var(--text-primary))] mb-2">
                All Projects
              </h1>
              <p className="text-[hsl(var(--text-secondary))] text-sm">
                {projects.length} {projects.length === 1 ? 'project' : 'projects'} total
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {/* Sort By Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-color))] rounded-lg px-4 py-2 pr-10 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="last_edited">Last edited</option>
                  <option value="name">Name</option>
                  <option value="created">Date created</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-secondary))] pointer-events-none" />
              </div>

              {/* Status Filter Placeholder */}
              <div className="relative">
                <select
                  className="appearance-none bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-color))] rounded-lg px-4 py-2 pr-10 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">Any status</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-secondary))] pointer-events-none" />
              </div>

              {/* Visibility Filter Placeholder */}
              <div className="relative">
                <select
                  className="appearance-none bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-color))] rounded-lg px-4 py-2 pr-10 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">Any visibility</option>
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--text-secondary))] pointer-events-none" />
              </div>
            </div>

            {/* Projects Grid */}
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getSortedProjects().map((project) => (
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
                              Edited {formatDate(project.last_viewed_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[hsl(var(--text-primary))] mb-2">
                  No projects yet
                </h3>
                <p className="text-[hsl(var(--text-secondary))] text-sm mb-6">
                  Start building your first landing page to see it here.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Create New Project
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
