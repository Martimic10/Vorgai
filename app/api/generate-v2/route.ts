import { createClient } from '@/lib/supabase/server'
import { createPageSkeleton } from '@/lib/landing-page/skeleton'
import { fillPageContentWithAI } from '@/lib/landing-page/ai-generator'
import { validatePageQuality } from '@/lib/landing-page/quality-validator'
import type { Page } from '@/lib/landing-page/types'

// ================================================================
// STRUCTURED LANDING PAGE GENERATION API
// ================================================================

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const body = await request.json()
    const {
      prompt,
      archetype = 'saas', // Default to SaaS archetype
    } = body

    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const sendUpdate = (type: string, content: any) => {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type, content })}\n\n`)
            )
          }

          // Step 1: Create page skeleton
          sendUpdate('status', 'Creating page structure...')
          const skeleton = createPageSkeleton(archetype, prompt)
          await new Promise(resolve => setTimeout(resolve, 300))

          // Step 2: Extract user input
          sendUpdate('status', 'Analyzing your requirements...')
          const userInput = extractUserInput(prompt)
          await new Promise(resolve => setTimeout(resolve, 300))

          // Update skeleton with basic info
          skeleton.brand.name = userInput.business
          skeleton.meta.title = `${userInput.business} - Landing Page`
          skeleton.meta.description = `${prompt.substring(0, 150)}`

          // Step 3: Fill content with AI
          sendUpdate('status', 'Generating compelling copy...')
          const filledPage = await fillPageContentWithAI(skeleton, userInput)
          await new Promise(resolve => setTimeout(resolve, 500))

          // Step 4: Quality validation
          sendUpdate('status', 'Validating quality...')
          const qualityReport = validatePageQuality(filledPage)
          await new Promise(resolve => setTimeout(resolve, 300))

          // Step 5: Send results
          sendUpdate('status', 'Page ready!')
          sendUpdate('page', filledPage)
          sendUpdate('quality', qualityReport)
          sendUpdate('done', '')

          controller.close()
        } catch (error: any) {
          console.error('Generation error:', error)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'error', content: error.message })}\n\n`
            )
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('API error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate page' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// ================================================================
// USER INPUT EXTRACTION
// ================================================================

function extractUserInput(prompt: string): {
  business: string
  audience: string
  goal: string
  tone: string
} {
  // Simple extraction logic - can be enhanced with AI later
  const business = extractBusiness(prompt)
  const audience = extractAudience(prompt)
  const goal = extractGoal(prompt)
  const tone = extractTone(prompt)

  return { business, audience, goal, tone }
}

function extractBusiness(prompt: string): string {
  // Look for patterns like "for X" or "about X"
  const patterns = [
    /(?:for|about)\s+(?:a|an)\s+([^,.]+)/i,
    /^(?:create|build|make)\s+(?:a|an)\s+([^,.]+)/i,
  ]

  for (const pattern of patterns) {
    const match = prompt.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }

  // Fallback: use first few words
  return prompt.split(' ').slice(0, 3).join(' ')
}

function extractAudience(prompt: string): string {
  const audiencePatterns = [
    /(?:for|targeting)\s+([^,.]*(?:users|customers|developers|designers|teams|businesses)[^,.]*)/i,
  ]

  for (const pattern of audiencePatterns) {
    const match = prompt.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }

  return 'general users'
}

function extractGoal(prompt: string): string {
  const goalPatterns = [
    /(?:to|that)\s+((?:help|enable|allow)[^,.]+)/i,
    /(?:goal|aim|purpose)(?:\s+is)?\s+to\s+([^,.]+)/i,
  ]

  for (const pattern of goalPatterns) {
    const match = prompt.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }

  return 'attract and convert users'
}

function extractTone(prompt: string): string {
  const toneKeywords = {
    professional: ['professional', 'enterprise', 'business', 'corporate'],
    friendly: ['friendly', 'approachable', 'casual', 'fun'],
    serious: ['serious', 'formal', 'authoritative', 'expert'],
  }

  const lowerPrompt = prompt.toLowerCase()

  for (const [tone, keywords] of Object.entries(toneKeywords)) {
    if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
      return tone
    }
  }

  return 'confident-clear'
}
