import OpenAI from 'openai'
import type { Page, Section } from './types'

// ================================================================
// AI CONTENT GENERATION
// ================================================================

export async function fillPageContentWithAI(
  page: Page,
  userInput: {
    business: string
    audience: string
    goal: string
    tone: string
  }
): Promise<Page> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  })

  const prompt = buildAIPrompt(page, userInput)

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a professional copywriter specializing in high-converting landing pages. You always output valid JSON.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  })

  const responseText = completion.choices[0]?.message?.content
  if (!responseText) {
    throw new Error('No response from OpenAI')
  }

  const filledPage = JSON.parse(responseText) as Page

  // Validate and retry if needed
  const validation = validatePageContent(filledPage)
  if (!validation.valid) {
    console.warn('Validation failed, attempting retry...', validation.errors)
    // For now, return the page anyway. In production, implement retry logic
  }

  return filledPage
}

// ================================================================
// AI PROMPT BUILDER
// ================================================================

function buildAIPrompt(page: Page, userInput: {
  business: string
  audience: string
  goal: string
  tone: string
}): string {
  return `You are a professional copywriter for landing pages. Your task is to fill in the content for a structured landing page.

STRICT RULES:
1. Output ONLY valid JSON matching the exact schema provided
2. Do NOT change the layout, section types, variants, or IDs
3. Do NOT add new fields or sections
4. Fill ONLY the "data" fields within each section
5. Write benefit-led, conversion-optimized copy
6. Keep headlines punchy and clear
7. Use active voice and strong verbs
8. Ensure all content aligns with the brand tone: ${page.brand.tone}

USER INPUT:
- Business: ${userInput.business}
- Target Audience: ${userInput.audience}
- Primary Goal: ${userInput.goal}
- Desired Tone: ${userInput.tone}

BRAND INFO:
- Name: ${page.brand.name || userInput.business}
- Theme: ${page.brand.theme}
- Primary Color: ${page.brand.primaryColor}
- Tone: ${page.brand.tone}

CURRENT PAGE STRUCTURE:
${JSON.stringify(page, null, 2)}

TASK:
Fill in ALL empty strings and arrays in the "data" fields of each section.

CONTENT GUIDELINES:
- Hero headline: Clear value proposition (max ${(page.layout.sections[0] as any).constraints?.maxHeadlineChars || 60} chars)
- Hero subheadline: Expand on benefits (max ${(page.layout.sections[0] as any).constraints?.maxSubheadlineChars || 150} chars)
- Features: Focus on outcomes, not features. Write 6 DISTINCT features that are specific to this industry
- Pricing: Use competitive, realistic pricing for this specific industry
- FAQ: Address common objections specific to this business type
- CTA: Create urgency without pressure
- Social proof: Use realistic company names OR industry-specific examples (e.g., "Trusted by 5,000+ fitness enthusiasts" for fitness)
- Icons: Use descriptive names like "lightning", "shield", "chart", "users", "star", "check", "rocket", "cog", "globe"
- Brand name: Extract from business description or create a catchy one

CRITICAL - MAKE IT UNIQUE:
- Every page should feel COMPLETELY different
- Tailor ALL copy to the specific industry and use case
- Use industry-specific terminology and pain points
- Make pricing realistic for THIS industry (e.g., fitness apps: $9-49/mo, enterprise SaaS: $99-999/mo)
- Features should be unique to this product category
- Headlines should reflect industry-specific value props
- Examples:
  * Fitness app: "Transform Your Body in 30 Days" NOT generic "Get Started Today"
  * Finance tool: "Save 10 Hours on Bookkeeping Weekly" NOT generic "Save Time"
  * Design tool: "Ship Pixel-Perfect Designs 10x Faster" NOT generic "Work Faster"

OUTPUT FORMAT:
Return ONLY the complete Page JSON object with all "data" fields filled in. No explanations, no markdown code blocks, just the JSON.`
}

// ================================================================
// VALIDATION
// ================================================================

interface ValidationResult {
  valid: boolean
  errors: string[]
}

function validatePageContent(page: Page): ValidationResult {
  const errors: string[] = []

  // Validate meta
  if (!page.meta.title || page.meta.title.length < 10) {
    errors.push('Meta title too short or missing')
  }
  if (!page.meta.description || page.meta.description.length < 50) {
    errors.push('Meta description too short or missing')
  }

  // Validate brand
  if (!page.brand.name) {
    errors.push('Brand name missing')
  }

  // Validate each section
  page.layout.sections.forEach((section, index) => {
    const sectionErrors = validateSection(section)
    errors.push(...sectionErrors.map(e => `Section ${index} (${section.type}): ${e}`))
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}

function validateSection(section: Section): string[] {
  const errors: string[] = []

  switch (section.type) {
    case 'hero':
      if (!section.data.headline || section.data.headline.length === 0) {
        errors.push('Headline missing')
      }
      if (section.data.headline.length > section.constraints.maxHeadlineChars) {
        errors.push(`Headline exceeds ${section.constraints.maxHeadlineChars} chars`)
      }
      if (!section.data.subheadline) {
        errors.push('Subheadline missing')
      }
      if (!section.data.primaryCta.label) {
        errors.push('Primary CTA label missing')
      }
      break

    case 'features':
      if (!section.data.sectionTitle) {
        errors.push('Section title missing')
      }
      if (section.data.items.length === 0) {
        errors.push('No feature items')
      }
      section.data.items.forEach((item, i) => {
        if (!item.title || !item.body || !item.icon) {
          errors.push(`Feature item ${i} incomplete`)
        }
      })
      break

    case 'pricing':
      if (!section.data.headline) {
        errors.push('Headline missing')
      }
      if (section.data.plans.length === 0) {
        errors.push('No pricing plans')
      }
      section.data.plans.forEach((plan, i) => {
        if (!plan.name || !plan.price || plan.features.length === 0) {
          errors.push(`Pricing plan ${i} incomplete`)
        }
      })
      break

    case 'faq':
      if (!section.data.headline) {
        errors.push('Headline missing')
      }
      if (section.data.items.length === 0) {
        errors.push('No FAQ items')
      }
      section.data.items.forEach((item, i) => {
        if (!item.question || !item.answer) {
          errors.push(`FAQ item ${i} incomplete`)
        }
      })
      break

    case 'cta':
      if (!section.data.headline) {
        errors.push('Headline missing')
      }
      if (!section.data.cta.label) {
        errors.push('CTA label missing')
      }
      break

    case 'footer':
      if (!section.data.copyright) {
        errors.push('Copyright missing')
      }
      break

    case 'social-proof':
      // Optional validation
      break
  }

  return errors
}

// ================================================================
// SECTION-SPECIFIC RETRY
// ================================================================

export async function retrySection(
  section: Section,
  userInput: {
    business: string
    audience: string
    goal: string
    tone: string
  }
): Promise<Section> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  })

  const prompt = `You are a professional copywriter. Fill in the content for this specific landing page section.

STRICT RULES:
1. Output ONLY valid JSON matching the exact schema
2. Do NOT change the type, variant, or id
3. Fill ONLY the "data" fields
4. Write benefit-led, conversion-optimized copy

USER CONTEXT:
- Business: ${userInput.business}
- Audience: ${userInput.audience}
- Goal: ${userInput.goal}
- Tone: ${userInput.tone}

SECTION SCHEMA:
${JSON.stringify(section, null, 2)}

OUTPUT:
Return ONLY the complete Section JSON object with "data" filled in. No explanations.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a professional copywriter. You always output valid JSON.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  })

  const responseText = completion.choices[0]?.message?.content
  if (!responseText) {
    throw new Error('No response from OpenAI')
  }

  return JSON.parse(responseText) as Section
}
