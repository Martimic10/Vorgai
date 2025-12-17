'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { StarsBackground } from '@/components/shooting-stars'
import { Navbar } from '@/components/navbar'
import { ArrowRight, Plus, X, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

const categories = [
  {
    name: 'SaaS Startup',
    prompt: `Create a professional SaaS landing page for a project management tool. Include a hero section with a bold headline and product screenshot, features section highlighting key capabilities like task management and team collaboration, pricing table with 3 tiers, customer testimonials, and a final call-to-action. Use a clean, modern design with blue as the primary color.`,
  },
  {
    name: 'Portfolio Website',
    prompt: `Design a creative portfolio landing page for a product designer. Include a hero section with an introduction and profile photo, featured work showcase in a grid layout with project thumbnails, skills and tools section, client testimonials, and a contact form. Use a minimalist dark theme with elegant typography and subtle animations.`,
  },
  {
    name: 'AI Tool Landing Page',
    prompt: `Build a landing page for an AI writing assistant. Include a hero with an animated demo showing AI text generation, key features list (content generation, templates, tone customization), use cases for different personas, pricing options (free and paid tiers), customer testimonials with results, and FAQ section. Use modern gradients and futuristic design elements.`,
  },
  {
    name: 'Mobile App Promo Page',
    prompt: `Create a landing page for a fitness tracking mobile app. Include a hero with app mockups and download buttons, features showcase with screenshots (workout plans, nutrition tracking, progress charts), how it works in 3 steps, user testimonials with results, pricing plans (free and premium), app store ratings, and device compatibility. Use vibrant gradients with orange and pink, energetic design.`,
  },
]

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [user, setUser] = useState<any>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()
  const { theme, toggleTheme } = useTheme()

  // Check if user is authenticated
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    checkUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleCategoryClick = (categoryPrompt: string) => {
    setPrompt(categoryPrompt)
  }

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!prompt.trim()) return

    // If user is signed in, go to generation page with prompt
    if (user) {
      router.push(`/generate?prompt=${encodeURIComponent(prompt)}`)
    } else {
      // If not signed in, go to signup
      router.push('/auth/signup')
    }
  }

  return (
    <>
      {/* Background Effects */}
      <div className="fixed inset-0 bg-background">
        <StarsBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/50" />
      </div>

      {/* Scrollable Content Wrapper */}
      <div className="relative h-screen overflow-y-auto md:overflow-hidden">
        {/* Navigation */}
        <Navbar />

        {/* Main Content */}
        <main className="relative z-10 flex flex-col items-center md:justify-center justify-start px-4 md:pt-16 pt-24 md:pb-32 pb-40 md:h-screen min-h-screen">
          <div className="w-full max-w-4xl mx-auto text-center space-y-12">
          {/* Hero Section */}
          <div className="space-y-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Generate landing pages{' '}
              <span className="block mt-2">instantly with AI.</span>
            </h1>
            <p className="text-base sm:text-lg text-foreground-secondary max-w-2xl mx-auto">
              Type a prompt, Vorg builds the site for you — no templates, no code.
            </p>
          </div>

          {/* Input Section */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative max-w-3xl mx-auto">
              <div className="relative bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-color))] rounded-xl p-3 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:border-[hsl(var(--border-hover))] transition-all">
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
                      handleSubmit(e)
                    }
                  }}
                  placeholder="Describe the landing page you want..."
                  className="w-full bg-transparent px-0 py-1 text-sm resize-none outline-none placeholder:text-[hsl(var(--text-tertiary))] placeholder:text-left text-left min-h-[60px] max-h-[180px] mb-2 text-[hsl(var(--text-primary))]"
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
                    className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Chips */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Try one of these:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    type="button"
                    onClick={() => handleCategoryClick(category.prompt)}
                    className="px-4 py-2 text-sm bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-sm"
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative md:fixed md:bottom-0 md:left-0 md:right-0 z-10 py-6 md:py-8 mt-auto md:mt-0">
        <div className="container-centered">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 px-4">
            {/* Left side - Legal links */}
            <div className="flex items-center gap-2 md:gap-3 order-2 md:order-1">
              <a
                href="/privacy"
                className="px-3 md:px-4 py-2 text-xs md:text-sm bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-color))] rounded-lg hover:bg-[hsl(var(--bg-tertiary))] hover:border-[hsl(var(--border-hover))] transition-all text-[hsl(var(--text-secondary))]"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="px-3 md:px-4 py-2 text-xs md:text-sm bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-color))] rounded-lg hover:bg-[hsl(var(--bg-tertiary))] hover:border-[hsl(var(--border-hover))] transition-all text-[hsl(var(--text-secondary))]"
              >
                Terms
              </a>
            </div>

            {/* Center - Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="px-3 md:px-4 py-2 text-xs md:text-sm bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-color))] rounded-lg hover:bg-[hsl(var(--bg-tertiary))] hover:border-[hsl(var(--border-hover))] transition-all text-[hsl(var(--text-secondary))] flex items-center gap-2 order-1 md:order-2"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4" />
                  <span className="hidden sm:inline">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  <span className="hidden sm:inline">Dark Mode</span>
                </>
              )}
            </button>

            {/* Right side - Social links */}
            <div className="flex items-center gap-2 md:gap-3 order-3">
              <a
                href="https://www.linkedin.com/in/michael-martinez-3a5b44256/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 md:px-4 py-2 text-xs md:text-sm bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-color))] rounded-lg hover:bg-[hsl(var(--bg-tertiary))] hover:border-[hsl(var(--border-hover))] transition-all text-[hsl(var(--text-secondary))] flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                </svg>
                <span className="hidden sm:inline">LinkedIn</span>
              </a>
              <a
                href="https://x.com/VORGAI"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 md:px-4 py-2 text-xs md:text-sm bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-color))] rounded-lg hover:bg-[hsl(var(--bg-tertiary))] hover:border-[hsl(var(--border-hover))] transition-all text-[hsl(var(--text-secondary))] flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="hidden sm:inline">Twitter</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </>
  )
}
