'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { BillingModal } from '@/components/billing-modal'
import { ExportModal } from '@/components/export-modal'
import { createProject, updateProject, getProject } from '@/lib/projects'
import { getUserSubscription } from '@/lib/subscription'
import { useTheme } from '@/contexts/theme-context'
import {
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  Maximize2,
  Download,
  Send,
  X,
  Plus,
  Moon,
  Sun,
  ExternalLink
} from 'lucide-react'

type DeviceMode = 'desktop' | 'tablet' | 'mobile'
type Message = {
  id: string
  type: 'ai' | 'user'
  content: string
  timestamp: Date
  imageUrl?: string
}

function GeneratePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { theme, toggleTheme } = useTheme()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [projectName, setProjectName] = useState('Untitled Project')
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDeviceMenuOpen, setIsDeviceMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedHTML, setGeneratedHTML] = useState('')
  const [isBillingOpen, setIsBillingOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [creditsRemaining, setCreditsRemaining] = useState(3)
  const [iframeKey, setIframeKey] = useState(0)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [userPlan, setUserPlan] = useState<'free' | 'starter' | 'pro' | 'agency'>('free')
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set())

  const initialPrompt = searchParams.get('prompt') || ''
  const existingProjectId = searchParams.get('id') || null
  const chatEndRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const deviceMenuRef = useRef<HTMLDivElement>(null)
  const projectMenuRef = useRef<HTMLDivElement>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isCreatingProject = useRef(false)
  const hasInitialized = useRef(false)

  useEffect(() => {
    const checkUser = async () => {
      if (hasInitialized.current) return // Only run once
      hasInitialized.current = true
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        router.push('/auth/login')
        return
      }

      setUser(user)
      setLoading(false)

      // Load existing project or create new one
      if (existingProjectId) {
        // Load existing project
        console.log('Loading existing project:', existingProjectId)
        const project = await getProject(existingProjectId)
        if (project) {
          console.log('Project loaded:', {
            name: project.name,
            hasHTML: !!project.html_content,
            messageCount: project.chat_history?.length || 0
          })
          setProjectId(project.id)
          setProjectName(project.name)
          setGeneratedHTML(project.html_content || '')

          // Convert chat_history back to Message objects with Date timestamps
          console.log('Raw chat_history from DB:', project.chat_history)
          const loadedMessages = (project.chat_history || []).map((msg: any) => ({
            id: msg.id,
            type: msg.type,
            content: msg.content,
            timestamp: new Date(msg.timestamp)
          }))
          console.log('Converted messages:', loadedMessages)
          setMessages(loadedMessages)
          console.log('Restored', loadedMessages.length, 'chat messages')
        } else {
          console.error('Failed to load project:', existingProjectId)
        }
      } else if (initialPrompt && !projectId && !isCreatingProject.current) {
        // Create new project only if we don't already have one and not currently creating
        isCreatingProject.current = true

        const generatedName = generateProjectName(initialPrompt)
        setProjectName(generatedName)

        // Create project in database
        console.log('Creating project with name:', generatedName, 'and prompt:', initialPrompt)
        const newProject = await createProject({
          name: generatedName,
          prompt: initialPrompt
        })

        if (newProject) {
          console.log('Project created successfully:', newProject.id)
          setProjectId(newProject.id)
          // Update URL with project ID
          router.replace(`/generate?id=${newProject.id}`)
        } else {
          console.error('Failed to create project - check Supabase console for errors')
          isCreatingProject.current = false // Reset on error
        }

        startGeneration(initialPrompt)
      }
    }

    checkUser()
  }, [router, supabase, initialPrompt, existingProjectId])

  useEffect(() => {
    // Load user's subscription plan and credits
    const loadSubscription = async () => {
      const subscription = await getUserSubscription()
      if (subscription) {
        setUserPlan(subscription.plan)
        // Calculate credits remaining based on plan
        const remaining = subscription.generationsLimit === -1
          ? 999 // Unlimited (show high number)
          : subscription.generationsLimit - subscription.generationsUsed
        setCreditsRemaining(Math.max(0, remaining))
      }
    }

    if (user) {
      loadSubscription()

      // Poll for subscription updates after successful payment
      if (typeof window !== 'undefined' && window.location.search.includes('success=true')) {
        let attempts = 0
        const maxAttempts = 15

        const pollSubscription = async () => {
          const subscription = await getUserSubscription()

          if (subscription && subscription.plan !== 'free') {
            setUserPlan(subscription.plan)
            const remaining = subscription.generationsLimit === -1
              ? 999
              : subscription.generationsLimit - subscription.generationsUsed
            setCreditsRemaining(Math.max(0, remaining))
            return
          }

          attempts++
          if (attempts < maxAttempts) {
            setTimeout(pollSubscription, 2000)
          }
        }

        setTimeout(pollSubscription, 2000)
      }
    }

    // Refresh when window gains focus (after payment)
    window.addEventListener('focus', loadSubscription)
    return () => window.removeEventListener('focus', loadSubscription)
  }, [user])

  useEffect(() => {
    // Close menus when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
      if (deviceMenuRef.current && !deviceMenuRef.current.contains(event.target as Node)) {
        setIsDeviceMenuOpen(false)
      }
      if (projectMenuRef.current && !projectMenuRef.current.contains(event.target as Node)) {
        setIsProjectMenuOpen(false)
        setIsRenaming(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    // Listen for messages from iframe to open billing modal or external URLs
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'openBillingModal') {
        setIsBillingOpen(true)
      } else if (event.data?.type === 'openUrl' && event.data?.url) {
        window.open(event.data.url, '_blank')
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Focus input when renaming
  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [isRenaming])

  // Auto-save project when HTML or messages change
  useEffect(() => {
    const saveProject = async () => {
      if (!projectId) return

      // Skip initial load, but allow saves after that
      if (messages.length === 0 && !generatedHTML) {
        console.log('Skipping auto-save - no content yet')
        return
      }

      console.log('Auto-saving project...', {
        projectId,
        messageCount: messages.length,
        hasHTML: !!generatedHTML
      })

      await updateProject(projectId, {
        html_content: generatedHTML,
        chat_history: messages.map(msg => ({
          id: msg.id,
          type: msg.type,
          content: msg.content,
          timestamp: msg.timestamp.toISOString()
        })),
        // Store "preview" as thumbnail URL - we'll render it client-side
        thumbnail_url: generatedHTML ? 'preview' : undefined
      })

      console.log('Auto-save complete')
    }

    // Debounce auto-save
    const timeoutId = setTimeout(saveProject, 1000)
    return () => clearTimeout(timeoutId)
  }, [generatedHTML, messages, projectId])

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const generateProjectName = (prompt: string) => {
    // Extract intelligent project name from the prompt
    const trimmed = prompt.trim()
    if (trimmed.length === 0) return 'Untitled Project'

    // First, check for brand names that look like custom names (capitalized words, no spaces, or specific patterns)
    // Examples: "Vortext", "GolfnGo", "TechStart", "MyApp"
    const customNameMatch = trimmed.match(/\b([A-Z][a-z]*(?:[A-Z][a-z]*)+)\b/)
    if (customNameMatch) {
      return customNameMatch[1]
    }

    // Check for quoted names: "MyBrand", 'MyBrand', etc.
    const quotedMatch = trimmed.match(/["']([^"']+)["']/)
    if (quotedMatch) {
      return quotedMatch[1]
        .split(/\s+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
    }

    // Check if "clone" appears in the prompt BEFORE cleaning
    const isCloneRequest = /\b(clone|like|similar\s+to)\b/i.test(trimmed)

    // Remove common prefixes and clean up, but keep "clone" for now
    let cleaned = trimmed
      .replace(/^(build|create|make|generate|design)\s+(me\s+)?((a|an)\s+)?/i, '')
      .replace(/landing\s+page\s+(for|of)?/i, '')
      .replace(/\b(website|page|site)\b/gi, '')
      .trim()

    // Check for famous brands/companies (clone requests)
    const brands = [
      'lovable', 'vercel', 'stripe', 'linear', 'notion', 'framer', 'figma', 'slack',
      'discord', 'twitter', 'github', 'gitlab', 'netflix', 'spotify',
      'airbnb', 'uber', 'whatsapp', 'telegram', 'instagram', 'facebook',
      'google', 'apple', 'microsoft', 'amazon', 'tesla', 'openai',
      'anthropic', 'shopify', 'squarespace', 'webflow', 'wordpress', 'bolt'
    ]

    // Check for brand matches
    const lowerCleaned = cleaned.toLowerCase()
    for (const brand of brands) {
      if (lowerCleaned.includes(brand)) {
        // Capitalize properly (handle special cases)
        let capitalizedBrand = brand.charAt(0).toUpperCase() + brand.slice(1)

        // Special cases for multi-word or special capitalization
        if (brand === 'openai') capitalizedBrand = 'OpenAI'
        if (brand === 'github') capitalizedBrand = 'GitHub'
        if (brand === 'gitlab') capitalizedBrand = 'GitLab'
        if (brand === 'whatsapp') capitalizedBrand = 'WhatsApp'

        return isCloneRequest ? `${capitalizedBrand} Clone` : capitalizedBrand
      }
    }

    // Remove "clone" and similar words from cleaned now for product type detection
    cleaned = cleaned.replace(/\b(clone|like|similar\s+to)\b/gi, '').trim()

    // Check for "called" or "named" patterns: "a SaaS app called Vortext"
    const namedMatch = cleaned.match(/\b(?:called|named)\s+([A-Z][a-zA-Z0-9]*(?:\s+[A-Z][a-zA-Z0-9]*)?)\b/)
    if (namedMatch) {
      return namedMatch[1]
    }

    // Check for "for" patterns: "for GolfnGo" or "for my startup Vortext"
    const forMatch = cleaned.match(/\bfor\s+(?:my\s+)?(?:startup|company|business|app|product)?\s*([A-Z][a-zA-Z0-9]+)\b/)
    if (forMatch) {
      return forMatch[1]
    }

    // Check for product types
    const productTypes: { [key: string]: string } = {
      'saas': 'SaaS Product',
      'e-commerce': 'E-commerce Store',
      'ecommerce': 'E-commerce Store',
      'shop': 'Online Shop',
      'store': 'Online Store',
      'portfolio': 'Portfolio',
      'blog': 'Blog',
      'agency': 'Agency',
      'startup': 'Startup',
      'app': 'Mobile App',
      'dashboard': 'Dashboard',
      'crm': 'CRM Platform',
      'analytics': 'Analytics Platform',
      'ai': 'AI Platform',
      'chat': 'Chat Application',
      'social': 'Social Platform',
      'marketplace': 'Marketplace'
    }

    const lowerCleanedForTypes = cleaned.toLowerCase()
    for (const [key, value] of Object.entries(productTypes)) {
      if (lowerCleanedForTypes.includes(key)) {
        // If there's additional context, use it
        const words = cleaned
          .split(/\s+/)
          .filter(w => w.length > 0)

        if (words.length > 1) {
          // Capitalize each word and limit to 3 words
          return words
            .slice(0, 3)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ')
        }
        return value
      }
    }

    // Extract meaningful words (capitalize first letter of each word)
    const words = cleaned
      .split(/\s+/)
      .filter(word => word.length > 2) // Remove short words like 'a', 'an', 'for'
      .slice(0, 3) // Max 3 words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())

    if (words.length > 0) {
      return words.join(' ')
    }

    return 'Landing Page Project'
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    // Convert to base64
    const reader = new FileReader()
    reader.onloadend = () => {
      setUploadedImage(reader.result as string)
    }
    reader.onerror = () => {
      alert('Failed to read image file')
    }
    reader.readAsDataURL(file)
  }

  const handlePlusClick = () => {
    console.log('Plus button clicked')
    console.log('fileInputRef.current:', fileInputRef.current)
    fileInputRef.current?.click()
  }

  const handleRemoveImage = () => {
    setUploadedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRename = async () => {
    setIsRenaming(false)
    setIsProjectMenuOpen(false)

    // Save project name to database
    if (projectId) {
      await updateProject(projectId, { name: projectName })
    }
  }

  const startGeneration = async (prompt: string) => {
    setIsGenerating(true)

    // Add user message to show what was requested
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: prompt,
      timestamp: new Date()
    }

    // Create AI message that will be updated with streaming content
    const aiMessageId = (Date.now() + 1).toString()
    const aiMessage: Message = {
      id: aiMessageId,
      type: 'ai',
      content: '',
      timestamp: new Date()
    }

    setMessages([userMessage, aiMessage])

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        // Handle limit reached error
        if (response.status === 402) {
          const errorData = await response.json()
          setMessages(prev => prev.map(msg =>
            msg.id === aiMessageId
              ? { ...msg, content: `❌ ${errorData.message}\n\nClick "Upgrade" below to get more projects.` }
              : msg
          ))
          setIsGenerating(false)
          setIsBillingOpen(true)
          return
        }
        throw new Error('Failed to generate')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No reader available')

      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))

            if (data.type === 'chat') {
              // AI's conversational response - replace the AI message content
              setMessages(prev => prev.map(msg =>
                msg.id === aiMessageId
                  ? { ...msg, content: data.content }
                  : msg
              ))
            } else if (data.type === 'status') {
              // Update AI message with status
              setMessages(prev => prev.map(msg =>
                msg.id === aiMessageId
                  ? { ...msg, content: msg.content ? msg.content + '\n' + data.content : data.content }
                  : msg
              ))
            } else if (data.type === 'html') {
              // Set the generated HTML
              setGeneratedHTML(data.content)
            } else if (data.type === 'error') {
              setMessages(prev => prev.map(msg =>
                msg.id === aiMessageId
                  ? { ...msg, content: 'Error: ' + data.content }
                  : msg
              ))
            }
          }
        }
      }
    } catch (error) {
      console.error('Generation error:', error)
      setMessages(prev => prev.map(msg =>
        msg.id === aiMessageId
          ? { ...msg, content: 'Failed to generate landing page. Please try again.' }
          : msg
      ))
    } finally {
      setIsGenerating(false)
    }
  }

  // Keep mock HTML for initial preview
  const mockHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vorg Landing Page</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

          .hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 120px 20px;
            text-align: center;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .hero h1 { font-size: 48px; margin-bottom: 16px; font-weight: 700; line-height: 1.1; }
          .hero p { font-size: 18px; margin-bottom: 36px; opacity: 0.8; max-width: 700px; margin-left: auto; margin-right: auto; }

          .hero-input-wrapper {
            max-width: 800px;
            margin: 0 auto 20px;
            background: rgba(50, 50, 50, 0.6);
            border-radius: 12px;
            padding: 2px;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .hero-input {
            width: 100%;
            background: transparent;
            border: none;
            color: white;
            padding: 12px 16px;
            font-size: 15px;
            outline: none;
            resize: none;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.5;
            min-height: 44px;
            max-height: 200px;
          }
          .hero-input::placeholder { color: rgba(255, 255, 255, 0.5); }

          .cta-button {
            background: white;
            color: #667eea;
            padding: 10px 24px;
            border-radius: 24px;
            text-decoration: none;
            font-weight: 600;
            display: inline-block;
            transition: transform 0.2s;
            font-size: 14px;
          }

          /* Responsive styles for larger screens */
          @media (min-width: 1920px) {
            .hero h1 { font-size: 48px; margin-bottom: 20px; }
            .hero p { font-size: 18px; margin-bottom: 32px; }
            .cta-button { padding: 14px 36px; font-size: 16px; }
          }

          @media (max-width: 768px) {
            .hero h1 { font-size: 28px; }
            .hero p { font-size: 13px; }
            .cta-button { padding: 9px 20px; font-size: 13px; }
          }
          .cta-button:hover { transform: scale(1.05); }

          .features {
            padding: 100px 20px;
            background: #f8f9fa;
            text-align: center;
          }
          .features h2 { font-size: 42px; margin-bottom: 60px; color: #333; }
          .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 40px;
            max-width: 1200px;
            margin: 0 auto;
          }
          .feature-card {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: transform 0.2s;
          }
          .feature-card:hover { transform: translateY(-5px); }
          .feature-card h3 { font-size: 26px; margin-bottom: 16px; color: #667eea; }
          .feature-card p { color: #666; line-height: 1.7; font-size: 16px; }

          .about {
            padding: 100px 20px;
            background: white;
            text-align: center;
          }
          .about h2 { font-size: 42px; margin-bottom: 30px; color: #333; }
          .about p { font-size: 18px; color: #666; line-height: 1.8; max-width: 800px; margin: 0 auto 40px; }

          .pricing {
            padding: 100px 20px;
            background: #f8f9fa;
            text-align: center;
          }
          .pricing h2 { font-size: 42px; margin-bottom: 60px; color: #333; }
          .pricing-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 40px;
            max-width: 1200px;
            margin: 0 auto;
          }
          .pricing-card {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .pricing-card.featured {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            transform: scale(1.05);
          }
          .pricing-card h3 { font-size: 28px; margin-bottom: 20px; }
          .pricing-card .price { font-size: 48px; font-weight: 700; margin-bottom: 20px; }
          .pricing-card ul { list-style: none; margin-bottom: 30px; }
          .pricing-card li { padding: 10px 0; }
          .pricing-button {
            background: #667eea;
            color: white;
            padding: 15px 40px;
            border-radius: 30px;
            text-decoration: none;
            font-weight: 600;
            display: inline-block;
          }
          .pricing-card.featured .pricing-button { background: white; color: #667eea; }

          .testimonials {
            padding: 100px 20px;
            background: white;
            text-align: center;
          }
          .testimonials h2 { font-size: 42px; margin-bottom: 60px; color: #333; }
          .testimonial-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 40px;
            max-width: 1200px;
            margin: 0 auto;
          }
          .testimonial-card {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 12px;
          }
          .testimonial-card p { font-style: italic; color: #555; margin-bottom: 20px; line-height: 1.6; }
          .testimonial-card .author { font-weight: 600; color: #667eea; }

          .cta-section {
            padding: 100px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
          }
          .cta-section h2 { font-size: 42px; margin-bottom: 20px; }
          .cta-section p { font-size: 20px; margin-bottom: 40px; opacity: 0.95; }

          .footer {
            background: #2d3748;
            color: white;
            padding: 60px 20px;
            text-align: center;
          }
          .footer p { margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <!-- Hero Section -->
        <section class="hero">
          <h1>Hey, let's build your mobile app!</h1>
          <div class="hero-input-wrapper">
            <textarea class="hero-input" rows="1" placeholder="Create a social media app where ..."></textarea>
          </div>
          <a href="#" class="cta-button">Build it →</a>
        </section>

        <!-- Features Section -->
        <section class="features">
          <h2>Why Choose Vorg?</h2>
          <div class="feature-grid">
            <div class="feature-card">
              <h3>⚡ Lightning Fast</h3>
              <p>Generate complete landing pages in seconds with our advanced AI technology. No waiting, no hassle.</p>
            </div>
            <div class="feature-card">
              <h3>🎨 Beautiful Design</h3>
              <p>Professional, conversion-optimized designs that make your brand stand out from the competition.</p>
            </div>
            <div class="feature-card">
              <h3>📱 Fully Responsive</h3>
              <p>Your pages look perfect on every device - desktop, tablet, and mobile. Guaranteed.</p>
            </div>
            <div class="feature-card">
              <h3>🚀 Easy to Use</h3>
              <p>Simply describe what you want, and watch as Vorg brings your vision to life instantly.</p>
            </div>
            <div class="feature-card">
              <h3>💎 Premium Quality</h3>
              <p>Every page is crafted with attention to detail and best practices in web design.</p>
            </div>
            <div class="feature-card">
              <h3>🔒 Secure & Reliable</h3>
              <p>Your data is safe with us. Enterprise-grade security and 99.9% uptime guaranteed.</p>
            </div>
          </div>
        </section>

        <!-- About Section -->
        <section class="about">
          <h2>How It Works</h2>
          <p>Vorg uses cutting-edge AI to understand your requirements and generate pixel-perfect landing pages. Simply describe your product, service, or idea in plain English, and our AI will create a professional website tailored to your needs.</p>
          <p>No coding skills required. No design experience needed. Just your creativity and Vorg's intelligence working together to create something amazing.</p>
        </section>

        <!-- Pricing Section -->
        <section class="pricing">
          <h2>Simple, Transparent Pricing</h2>
          <div class="pricing-grid">
            <div class="pricing-card">
              <h3>Starter</h3>
              <div class="price">$9<span style="font-size: 20px;">/mo</span></div>
              <ul>
                <li>✓ 5 Landing Pages</li>
                <li>✓ Basic Templates</li>
                <li>✓ Mobile Responsive</li>
                <li>✓ Email Support</li>
              </ul>
              <a href="#" class="pricing-button">Get Started</a>
            </div>
            <div class="pricing-card featured">
              <h3>Professional</h3>
              <div class="price">$29<span style="font-size: 20px;">/mo</span></div>
              <ul>
                <li>✓ Unlimited Pages</li>
                <li>✓ Premium Templates</li>
                <li>✓ Custom Domains</li>
                <li>✓ Priority Support</li>
              </ul>
              <a href="#" class="pricing-button">Get Started</a>
            </div>
            <div class="pricing-card">
              <h3>Enterprise</h3>
              <div class="price">$99<span style="font-size: 20px;">/mo</span></div>
              <ul>
                <li>✓ Everything in Pro</li>
                <li>✓ White Label</li>
                <li>✓ API Access</li>
                <li>✓ Dedicated Manager</li>
              </ul>
              <a href="#" class="pricing-button">Contact Sales</a>
            </div>
          </div>
        </section>

        <!-- Testimonials Section -->
        <section class="testimonials">
          <h2>What Our Customers Say</h2>
          <div class="testimonial-grid">
            <div class="testimonial-card">
              <p>"Vorg helped us launch our product landing page in under an hour. The results were incredible and our conversion rate doubled!"</p>
              <div class="author">- Sarah Johnson, CEO at TechStart</div>
            </div>
            <div class="testimonial-card">
              <p>"I've tried many landing page builders, but Vorg's AI is on another level. It understands exactly what I need."</p>
              <div class="author">- Michael Chen, Marketing Director</div>
            </div>
            <div class="testimonial-card">
              <p>"The best investment we made this year. Vorg saves us countless hours and the pages look professionally designed."</p>
              <div class="author">- Emily Rodriguez, Founder</div>
            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section class="cta-section">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of businesses using Vorg to create stunning landing pages</p>
          <a href="#" class="cta-button">Start Building Now</a>
        </section>

        <!-- Footer -->
        <footer class="footer">
          <p>&copy; 2024 Vorg. All rights reserved.</p>
          <p>Built with AI • Powered by Innovation</p>
        </footer>

        <!-- Made with Vorg Badge -->
        <style>
          .vorg-upgrade-link {
            color: #3b82f6;
            text-decoration: underline;
            cursor: pointer;
          }
          .vorg-upgrade-link:hover {
            color: #2563eb;
          }
        </style>
        <div id="vorgBadgeWrapper" class="vorg-badge-wrapper" style="position: fixed; bottom: 16px; right: 16px; z-index: 9999;">
          <!-- Tooltip -->
          <div id="vorgTooltip" class="vorg-tooltip" style="position: absolute; bottom: calc(100% + 8px); right: 0; background: white; border-radius: 8px; padding: 10px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); white-space: nowrap; opacity: 0; visibility: hidden; transform: translateY(4px); transition: all 0.2s; pointer-events: auto;">
            <p style="margin: 0; font-size: 11px; color: #666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.4;">
              Upgrade to <a href="#" id="starterPlanLink" class="vorg-upgrade-link" style="font-weight: 600;">Starter Plan</a> to remove branding.
            </p>
            <div style="position: absolute; bottom: -4px; right: 20px; width: 8px; height: 8px; background: white; transform: rotate(45deg);"></div>
          </div>

          <!-- Badge -->
          <a href="https://vorg.com" target="_blank" rel="noopener noreferrer" style="text-decoration: none;">
            <div id="vorgBadge" style="background: white; border-radius: 8px; padding: 8px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;">
              <img src="/Vorg.png" alt="Vorg" style="width: 16px; height: 16px; object-fit: contain;">
              <span style="font-size: 12px; font-weight: 600; color: #333; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">Made with Vorg</span>
            </div>
          </a>
        </div>

        <script>
          (function() {
            const wrapper = document.getElementById('vorgBadgeWrapper');
            const tooltip = document.getElementById('vorgTooltip');
            const badge = document.getElementById('vorgBadge');
            const starterPlanLink = document.getElementById('starterPlanLink');
            let hideTimeout;

            function showTooltip() {
              clearTimeout(hideTimeout);
              tooltip.style.opacity = '1';
              tooltip.style.visibility = 'visible';
              tooltip.style.transform = 'translateY(0)';
              badge.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
            }

            function hideTooltip() {
              hideTimeout = setTimeout(function() {
                tooltip.style.opacity = '0';
                tooltip.style.visibility = 'hidden';
                tooltip.style.transform = 'translateY(4px)';
                badge.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }, 100);
            }

            if (wrapper && tooltip && badge) {
              wrapper.addEventListener('mouseenter', showTooltip);
              wrapper.addEventListener('mouseleave', hideTooltip);
              tooltip.addEventListener('mouseenter', showTooltip);
              tooltip.addEventListener('mouseleave', hideTooltip);
            }

            // Handle Starter Plan link click - send message to parent window
            if (starterPlanLink) {
              starterPlanLink.addEventListener('click', function(e) {
                e.preventDefault();
                window.parent.postMessage('openBillingModal', '*');
              });
            }
          })();
        </script>
      </body>
      </html>
    `

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isGenerating) return

    // Add user message with optional image
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      imageUrl: uploadedImage || undefined
    }

    setMessages(prev => [...prev, userMessage])
    const userPrompt = inputValue
    const imageToSend = uploadedImage
    setInputValue('')
    setUploadedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setIsGenerating(true)

    // Create AI message that will be updated with streaming content
    const aiMessageId = (Date.now() + 1).toString()
    const aiMessage: Message = {
      id: aiMessageId,
      type: 'ai',
      content: '',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, aiMessage])

    try {
      // Build conversation history for context
      const conversationHistory = messages
        .filter(msg => msg.content)
        .map(msg => ({
          role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        }))

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          conversationHistory,
          currentHTML: generatedHTML, // Pass current HTML for incremental updates
          imageUrl: imageToSend // Pass uploaded image if available
        }),
      })

      if (!response.ok) throw new Error('Failed to generate')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No reader available')

      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))

            if (data.type === 'chat') {
              // AI's conversational response - replace the AI message content
              setMessages(prev => prev.map(msg =>
                msg.id === aiMessageId
                  ? { ...msg, content: data.content }
                  : msg
              ))
            } else if (data.type === 'status') {
              // Status updates - append to AI message
              setMessages(prev => prev.map(msg =>
                msg.id === aiMessageId
                  ? { ...msg, content: msg.content ? msg.content + '\n' + data.content : data.content }
                  : msg
              ))
            } else if (data.type === 'html') {
              setGeneratedHTML(data.content)
            } else if (data.type === 'error') {
              setMessages(prev => prev.map(msg =>
                msg.id === aiMessageId
                  ? { ...msg, content: 'Error: ' + data.content }
                  : msg
              ))
            }
          }
        }
      }
    } catch (error) {
      console.error('Generation error:', error)
      setMessages(prev => prev.map(msg =>
        msg.id === aiMessageId
          ? { ...msg, content: 'Failed to update landing page. Please try again.' }
          : msg
      ))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getDeviceIcon = (mode: DeviceMode) => {
    switch (mode) {
      case 'desktop': return <Monitor className="w-4 h-4" />
      case 'tablet': return <Tablet className="w-4 h-4" />
      case 'mobile': return <Smartphone className="w-4 h-4" />
    }
  }

  const getDeviceLabel = (mode: DeviceMode) => {
    switch (mode) {
      case 'desktop': return 'Desktop'
      case 'tablet': return 'iPad'
      case 'mobile': return 'iPhone'
    }
  }

  const handleRefresh = () => {
    // Force iframe to reload by changing its key
    setIframeKey(prev => prev + 1)
  }

  const handleOpenInBrowser = () => {
    if (!generatedHTML) return

    // Replace /Vorg.png with absolute URL for blob context
    const htmlWithAbsoluteLogo = generatedHTML.replace(
      /src="\/Vorg\.png"/g,
      `src="${window.location.origin}/Vorg.png"`
    )

    // Create a blob from the HTML content
    const blob = new Blob([htmlWithAbsoluteLogo], { type: 'text/html' })
    const url = URL.createObjectURL(blob)

    // Open in new tab
    window.open(url, '_blank')

    // Clean up the blob URL after a short delay
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-secondary))] flex items-center justify-center">
        <div className="text-[hsl(var(--text-primary))]">Loading...</div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-[hsl(var(--bg-secondary))] flex flex-col overflow-hidden m-0 p-0">
      {/* Top Navigation Bar */}
      <nav className="h-14 bg-[hsl(var(--bg-secondary))] flex items-center justify-between px-6 flex-shrink-0 w-full border-b border-white/5">
        {/* Left: Logo & Project Name */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="relative w-7 h-7">
              <Image
                src="/Vorg.png"
                alt="Vorg Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <span className="text-[hsl(var(--text-secondary))]">/</span>

          {/* Project Name Dropdown */}
          <div className="relative" ref={projectMenuRef}>
            {isRenaming ? (
              <input
                ref={renameInputRef}
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRename()
                  } else if (e.key === 'Escape') {
                    setIsRenaming(false)
                  }
                }}
                onBlur={handleRename}
                className="bg-white/10 text-[hsl(var(--text-primary))] text-sm font-medium outline-none border border-white/20 px-2 py-1 rounded"
              />
            ) : (
              <button
                onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
                className="bg-transparent text-[hsl(var(--text-primary))] text-sm font-medium hover:bg-[hsl(var(--bg-tertiary))] px-2 py-1 rounded transition-colors flex items-center gap-1"
              >
                {projectName}
                <svg className="w-3 h-3 text-[hsl(var(--text-secondary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}

            {/* Dropdown Menu */}
            {isProjectMenuOpen && !isRenaming && (
              <div className="absolute left-0 top-10 w-40 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-color))] rounded-lg shadow-2xl overflow-hidden z-50">
                <button
                  onClick={() => {
                    setIsProjectMenuOpen(false)
                    setIsRenaming(true)
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-[hsl(var(--bg-tertiary))] transition-colors w-full text-left text-sm text-[hsl(var(--text-primary))]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Rename
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Preview Controls, Export & Avatar */}
        <div className="flex items-center gap-3">
          {/* Device Selector */}
          <div className="relative" ref={deviceMenuRef}>
            <button
              onClick={() => setIsDeviceMenuOpen(!isDeviceMenuOpen)}
              className="p-2 hover:bg-[hsl(var(--bg-tertiary))] rounded-lg transition-colors text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]"
              title={getDeviceLabel(deviceMode)}
            >
              {getDeviceIcon(deviceMode)}
            </button>

            {isDeviceMenuOpen && (
              <div className="absolute right-0 top-10 w-40 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-color))] rounded-lg shadow-2xl overflow-hidden z-50">
                <button
                  onClick={() => { setDeviceMode('desktop'); setIsDeviceMenuOpen(false) }}
                  className="flex items-center gap-2 px-4 py-2.5 hover:bg-[hsl(var(--bg-tertiary))] transition-colors w-full text-left text-sm text-[hsl(var(--text-primary))]"
                >
                  <Monitor className="w-4 h-4" />
                  Desktop
                </button>
                <button
                  onClick={() => { setDeviceMode('tablet'); setIsDeviceMenuOpen(false) }}
                  className="flex items-center gap-2 px-4 py-2.5 hover:bg-[hsl(var(--bg-tertiary))] transition-colors w-full text-left text-sm text-[hsl(var(--text-primary))]"
                >
                  <Tablet className="w-4 h-4" />
                  iPad
                </button>
                <button
                  onClick={() => { setDeviceMode('mobile'); setIsDeviceMenuOpen(false) }}
                  className="flex items-center gap-2 px-4 py-2.5 hover:bg-[hsl(var(--bg-tertiary))] transition-colors w-full text-left text-sm text-[hsl(var(--text-primary))]"
                >
                  <Smartphone className="w-4 h-4" />
                  iPhone
                </button>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-[hsl(var(--bg-tertiary))] rounded-lg transition-colors text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]"
            title="Refresh Preview"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-[hsl(var(--bg-tertiary))] rounded-lg transition-colors text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Open in Browser */}
          <button
            onClick={handleOpenInBrowser}
            disabled={!generatedHTML}
            className="p-2 hover:bg-[hsl(var(--bg-tertiary))] rounded-lg transition-colors text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] disabled:opacity-40 disabled:cursor-not-allowed"
            title="Open in Browser"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-white/10" />

          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-[hsl(var(--text-primary))] text-sm font-medium rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>

          {/* User Avatar Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <span className="text-[hsl(var(--text-primary))] text-xs font-semibold">
                {user?.email?.[0].toUpperCase() || 'U'}
              </span>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 top-12 w-56 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-color))] rounded-lg shadow-2xl overflow-hidden z-50">
                <div className="p-3 border-b border-[hsl(var(--border-color))]">
                  <p className="text-sm text-[hsl(var(--text-primary))] font-medium truncate">{user?.email}</p>
                  <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">
                    {userPlan === 'free' ? 'Free Plan' : `${userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} Plan`}
                  </p>
                </div>

                {/* Credits Counter */}
                <div className="px-4 py-3 bg-[hsl(var(--bg-tertiary))] border-b border-[hsl(var(--border-color))]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[hsl(var(--text-secondary))]">
                      {userPlan === 'agency' ? 'Projects Created' : 'Projects Remaining'}
                    </span>
                    <span className="text-sm font-semibold text-[hsl(var(--text-primary))]">
                      {userPlan === 'agency' ? '∞' : `${creditsRemaining}/${
                        userPlan === 'free' ? 3 : userPlan === 'starter' ? 10 : userPlan === 'pro' ? 20 : 0
                      }`}
                    </span>
                  </div>
                  {userPlan !== 'agency' && (
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          creditsRemaining === 0 ? 'bg-red-500' : creditsRemaining <= 2 ? 'bg-orange-500' : 'bg-gradient-to-r from-blue-500 to-purple-600'
                        }`}
                        style={{
                          width: `${userPlan === 'free'
                            ? (creditsRemaining / 3) * 100
                            : userPlan === 'starter'
                            ? (creditsRemaining / 10) * 100
                            : userPlan === 'pro'
                            ? (creditsRemaining / 20) * 100
                            : 0}%`
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="py-2">
                  <button
                    onClick={() => {
                      toggleTheme()
                    }}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-[hsl(var(--bg-tertiary))] transition-colors w-full text-left text-sm text-[hsl(var(--text-primary))]"
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
                      setIsUserMenuOpen(false)
                      setIsBillingOpen(true)
                    }}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-[hsl(var(--bg-tertiary))] transition-colors w-full text-left text-sm text-[hsl(var(--text-primary))]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Upgrade
                  </button>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-[hsl(var(--bg-tertiary))] transition-colors w-full text-left text-sm text-[hsl(var(--text-primary))]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-[hsl(var(--bg-tertiary))] transition-colors w-full text-left text-sm text-[hsl(var(--text-primary))]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden w-full m-0 p-0 pr-2 pt-2 pb-2">
        {/* Left Panel: AI Console - 30% width */}
        {!isFullscreen && (
          <div className="w-[30%] h-full flex flex-col bg-[hsl(var(--bg-secondary))] overflow-hidden">
            {/* Chat Messages - Scrollable */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin">
              {messages.length === 0 && (
                <div className="text-gray-500 text-sm">No messages yet...</div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="flex justify-start"
                >
                  {message.type === 'user' ? (
                    <div className="w-full rounded-lg px-4 py-3">
                      {message.imageUrl && (
                        <div className="mb-3">
                          <img
                            src={message.imageUrl}
                            alt="Reference"
                            className="max-w-full h-auto rounded-lg border border-[hsl(var(--border-color))]"
                            style={{ maxHeight: '200px' }}
                          />
                        </div>
                      )}
                      <p className="text-[hsl(var(--text-primary))] text-sm whitespace-pre-wrap leading-relaxed font-medium">
                        {message.content}
                      </p>
                    </div>
                  ) : (
                    <div className="w-full px-4 py-3">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-[hsl(var(--text-primary))] text-[10px]">✦</span>
                        </div>
                        <span className="text-[hsl(var(--text-primary))]/60 text-xs">Thought for 13s</span>
                      </div>

                      {/* Lovable-style formatted content */}
                      <div className="text-[hsl(var(--text-primary))]/90 text-sm leading-relaxed space-y-3">
                        {/* Title */}
                        <p className="font-medium text-[hsl(var(--text-primary))]">
                          Your landing page is live! It features:
                        </p>

                        {/* Feature bullets with bold labels */}
                        {generatedHTML && (
                          <div className="space-y-2 pl-1">
                            {(generatedHTML.includes('nav') || generatedHTML.includes('header')) && (
                              <div className="flex gap-2">
                                <span className="text-[hsl(var(--text-primary))]/60 mt-0.5">•</span>
                                <p>
                                  <span className="font-semibold text-[hsl(var(--text-primary))]">Navigation bar</span>
                                  <span className="text-[hsl(var(--text-primary))]/80"> with smooth scrolling and responsive menu</span>
                                </p>
                              </div>
                            )}
                            {generatedHTML.includes('hero') && (
                              <div className="flex gap-2">
                                <span className="text-[hsl(var(--text-primary))]/60 mt-0.5">•</span>
                                <p>
                                  <span className="font-semibold text-[hsl(var(--text-primary))]">Hero section</span>
                                  <span className="text-[hsl(var(--text-primary))]/80"> with compelling headline and call-to-action</span>
                                </p>
                              </div>
                            )}
                            {(generatedHTML.includes('features') || generatedHTML.includes('feature')) && (
                              <div className="flex gap-2">
                                <span className="text-[hsl(var(--text-primary))]/60 mt-0.5">•</span>
                                <p>
                                  <span className="font-semibold text-[hsl(var(--text-primary))]">Features grid</span>
                                  <span className="text-[hsl(var(--text-primary))]/80"> showcasing key benefits with icons</span>
                                </p>
                              </div>
                            )}
                            {generatedHTML.includes('pricing') && (
                              <div className="flex gap-2">
                                <span className="text-[hsl(var(--text-primary))]/60 mt-0.5">•</span>
                                <p>
                                  <span className="font-semibold text-[hsl(var(--text-primary))]">Pricing section</span>
                                  <span className="text-[hsl(var(--text-primary))]/80"> with multiple tiers and feature comparisons</span>
                                </p>
                              </div>
                            )}
                            {generatedHTML.includes('testimonial') && (
                              <div className="flex gap-2">
                                <span className="text-[hsl(var(--text-primary))]/60 mt-0.5">•</span>
                                <p>
                                  <span className="font-semibold text-[hsl(var(--text-primary))]">Testimonials</span>
                                  <span className="text-[hsl(var(--text-primary))]/80"> featuring customer reviews and ratings</span>
                                </p>
                              </div>
                            )}
                            {generatedHTML.includes('faq') && (
                              <div className="flex gap-2">
                                <span className="text-[hsl(var(--text-primary))]/60 mt-0.5">•</span>
                                <p>
                                  <span className="font-semibold text-[hsl(var(--text-primary))]">FAQ section</span>
                                  <span className="text-[hsl(var(--text-primary))]/80"> answering common questions</span>
                                </p>
                              </div>
                            )}
                            {(generatedHTML.includes('cta') || generatedHTML.includes('call-to-action')) && (
                              <div className="flex gap-2">
                                <span className="text-[hsl(var(--text-primary))]/60 mt-0.5">•</span>
                                <p>
                                  <span className="font-semibold text-[hsl(var(--text-primary))]">Call-to-action</span>
                                  <span className="text-[hsl(var(--text-primary))]/80"> driving conversions</span>
                                </p>
                              </div>
                            )}
                            {generatedHTML.includes('footer') && (
                              <div className="flex gap-2">
                                <span className="text-[hsl(var(--text-primary))]/60 mt-0.5">•</span>
                                <p>
                                  <span className="font-semibold text-[hsl(var(--text-primary))]">Footer</span>
                                  <span className="text-[hsl(var(--text-primary))]/80"> with links and social media</span>
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* What's next section */}
                        {expandedMessages.has(message.id) && (
                          <div className="pt-2 mt-3 border-t border-[hsl(var(--border-color))]">
                            <p className="font-medium text-[hsl(var(--text-primary))] mb-2">What's next?</p>
                            <div className="space-y-2 pl-1">
                              <div className="flex gap-2">
                                <span className="text-[hsl(var(--text-primary))]/60 mt-0.5">•</span>
                                <p>
                                  <span className="font-semibold text-[hsl(var(--text-primary))]">Refine & Customize:</span>
                                  <span className="text-[hsl(var(--text-primary))]/80"> Ask me to adjust colors, fonts, or layouts to match your brand</span>
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-[hsl(var(--text-primary))]/60 mt-0.5">•</span>
                                <p>
                                  <span className="font-semibold text-[hsl(var(--text-primary))]">Add Content:</span>
                                  <span className="text-[hsl(var(--text-primary))]/80"> Replace placeholder text with your actual copy and images</span>
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-[hsl(var(--text-primary))]/60 mt-0.5">•</span>
                                <p>
                                  <span className="font-semibold text-[hsl(var(--text-primary))]">Enhance Interactivity:</span>
                                  <span className="text-[hsl(var(--text-primary))]/80"> Request animations, form validation, or interactive elements</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-4">
                        <button
                          onClick={() => {
                            setExpandedMessages(prev => {
                              const newSet = new Set(prev)
                              if (newSet.has(message.id)) {
                                newSet.delete(message.id)
                              } else {
                                newSet.add(message.id)
                              }
                              return newSet
                            })
                          }}
                          className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] rounded-md text-xs text-[hsl(var(--text-primary))]/80 transition-all"
                        >
                          {expandedMessages.has(message.id) ? 'Show less' : 'Show all'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="w-full px-4 py-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-[hsl(var(--text-primary))] text-[10px]">✦</span>
                      </div>
                      <span className="text-[hsl(var(--text-primary))]/60 text-xs">Thinking...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse" />
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse delay-100" />
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse delay-200" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="px-4 pb-4 pt-3 bg-[hsl(var(--bg-secondary))]">
              <form onSubmit={handleSendMessage}>
                <div className="relative bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border-color))] rounded-xl p-3 hover:border-blue-500/50 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
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
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-[hsl(var(--text-primary))] rounded-full flex items-center justify-center transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(e)
                      }
                    }}
                    placeholder="How can Vorg help you today?"
                    className="w-full bg-transparent px-0 py-1 text-sm resize-none outline-none placeholder:text-[hsl(var(--text-secondary))] text-[hsl(var(--text-primary))] min-h-[50px] max-h-[150px] mb-2 overflow-y-auto"
                    disabled={isGenerating}
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
                      className="flex-shrink-0 flex items-center justify-center w-8 h-8 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--hover-bg))] rounded-lg transition-all"
                      title="Upload reference image"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || isGenerating}
                      className="flex-shrink-0 flex items-center justify-center w-9 h-9 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Right Panel: Live Preview */}
        <div className={`${isFullscreen ? 'w-full' : 'flex-1'} h-full flex flex-col overflow-hidden rounded-2xl bg-[hsl(var(--bg-secondary))]`}>
          {/* Preview Frame */}
          <div className="flex-1 overflow-y-auto flex items-center justify-center p-2 md:p-3">
            {deviceMode === 'desktop' ? (
              <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-2xl">
                {generatedHTML ? (
                  <iframe
                    key={iframeKey}
                    srcDoc={generatedHTML}
                    className="w-full h-full border-0"
                    title="Generated Landing Page Preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
                ) : (
                  <div className="p-8 min-h-full flex items-center justify-center">
                    <div className="text-center space-y-6">
                      <h1 className="text-4xl font-bold text-gray-900">Your Landing Page</h1>
                      <p className="text-lg text-gray-600">Preview will appear here as Vorg generates your page...</p>
                      <div className="flex justify-center gap-4 pt-8">
                        <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl animate-pulse" />
                        <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl animate-pulse delay-100" />
                        <div className="w-32 h-32 bg-gradient-to-br from-pink-500 to-orange-600 rounded-xl animate-pulse delay-200" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : deviceMode === 'tablet' ? (
              /* iPad Frame - Responsive */
              <div className="relative w-full max-w-[500px] xl:max-w-[768px]" style={{ aspectRatio: '768/1024' }}>
                <div className="w-full h-full bg-[#1f1f1f] rounded-[40px] p-4 xl:p-6 shadow-2xl border-4 xl:border-8 border-[#2a2a2a]">
                  <div className="w-full h-full bg-white rounded-[20px] xl:rounded-[24px] overflow-hidden">
                    {generatedHTML ? (
                      <iframe
                        key={iframeKey}
                        srcDoc={generatedHTML}
                        className="w-full h-full border-0"
                        title="Generated Landing Page Preview"
                        sandbox="allow-scripts allow-same-origin"
                      />
                    ) : (
                      <div className="p-8 h-full flex items-center justify-center">
                        <div className="text-center space-y-6">
                          <h1 className="text-3xl font-bold text-gray-900">Your Landing Page</h1>
                          <p className="text-base text-gray-600">Preview will appear here...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* iPhone Frame - Responsive */
              <div className="relative w-full max-w-[280px] xl:max-w-[402px]" style={{ aspectRatio: '402/874' }}>
                <div className="w-full h-full bg-[#1f1f1f] rounded-[40px] xl:rounded-[55px] p-2 xl:p-3 shadow-2xl border-8 xl:border-[14px] border-[#2a2a2a]">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 xl:w-40 h-5 xl:h-7 bg-[#1f1f1f] rounded-b-3xl z-10" />

                  <div className="w-full h-full bg-white rounded-[30px] xl:rounded-[42px] overflow-hidden">
                    {generatedHTML ? (
                      <iframe
                        key={iframeKey}
                        srcDoc={generatedHTML}
                        className="w-full h-full border-0"
                        title="Generated Landing Page Preview"
                        sandbox="allow-scripts allow-same-origin"
                      />
                    ) : (
                      <div className="p-6 h-full flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <h1 className="text-2xl font-bold text-gray-900">Your Landing Page</h1>
                          <p className="text-sm text-gray-600">Preview will appear here...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Billing Modal */}
      <BillingModal
        isOpen={isBillingOpen}
        onClose={() => setIsBillingOpen(false)}
        user={user}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        userPlan={userPlan}
        onUpgrade={() => {
          setIsExportOpen(false)
          setIsBillingOpen(true)
        }}
        generatedHTML={generatedHTML}
      />
    </div>
  )
}

export default function GeneratePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[hsl(var(--bg-secondary))] flex items-center justify-center">
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
          <p className="text-[hsl(var(--text-secondary))] text-sm mt-2">Loading editor...</p>
        </div>
      </div>
    }>
      <GeneratePageContent />
    </Suspense>
  )
}
