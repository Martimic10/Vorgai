import type { Page, Section } from './types'

// ================================================================
// QUALITY VALIDATION SYSTEM
// ================================================================

export interface QualityReport {
  score: number // 0-100
  grade: 'excellent' | 'good' | 'fair' | 'poor'
  issues: QualityIssue[]
  suggestions: string[]
}

export interface QualityIssue {
  severity: 'critical' | 'warning' | 'suggestion'
  section: string
  message: string
}

export function validatePageQuality(page: Page): QualityReport {
  const issues: QualityIssue[] = []
  const suggestions: string[] = []

  // Validate meta
  validateMeta(page, issues, suggestions)

  // Validate each section
  page.layout.sections.forEach((section) => {
    validateSectionQuality(section, issues, suggestions)
  })

  // Calculate score
  const score = calculateScore(issues)
  const grade = getGrade(score)

  return {
    score,
    grade,
    issues,
    suggestions,
  }
}

// ================================================================
// META VALIDATION
// ================================================================

function validateMeta(page: Page, issues: QualityIssue[], suggestions: string[]) {
  if (page.meta.title.length > 60) {
    issues.push({
      severity: 'warning',
      section: 'meta',
      message: 'Title exceeds 60 characters (may be truncated in search results)',
    })
  }

  if (page.meta.description.length > 160) {
    issues.push({
      severity: 'warning',
      section: 'meta',
      message: 'Description exceeds 160 characters (may be truncated in search results)',
    })
  }

  if (page.meta.description.length < 120) {
    suggestions.push('Consider expanding meta description to 120-160 characters for better SEO')
  }
}

// ================================================================
// SECTION VALIDATION
// ================================================================

function validateSectionQuality(
  section: Section,
  issues: QualityIssue[],
  suggestions: string[]
) {
  switch (section.type) {
    case 'hero':
      validateHero(section, issues, suggestions)
      break
    case 'features':
      validateFeatures(section, issues, suggestions)
      break
    case 'pricing':
      validatePricing(section, issues, suggestions)
      break
    case 'faq':
      validateFAQ(section, issues, suggestions)
      break
    case 'social-proof':
      validateSocialProof(section, issues, suggestions)
      break
  }
}

// ================================================================
// HERO VALIDATION
// ================================================================

function validateHero(
  section: { type: 'hero'; data: any },
  issues: QualityIssue[],
  suggestions: string[]
) {
  const { headline, subheadline, primaryCta } = section.data

  // Weak headline patterns
  const weakPatterns = [
    /^welcome to/i,
    /^introducing/i,
    /^we are/i,
    /^check out/i,
  ]

  if (weakPatterns.some((pattern) => pattern.test(headline))) {
    issues.push({
      severity: 'warning',
      section: 'hero',
      message: 'Headline uses weak opening (avoid "Welcome to", "Introducing", etc.)',
    })
    suggestions.push('Start headline with clear value proposition or outcome')
  }

  // Headline length
  if (headline.length < 20) {
    issues.push({
      severity: 'suggestion',
      section: 'hero',
      message: 'Headline may be too short to communicate value',
    })
  }

  // Subheadline length
  if (subheadline.length < 50) {
    suggestions.push('Expand subheadline to better explain benefits')
  }

  // CTA quality
  const weakCTAs = ['click here', 'submit', 'go', 'enter', 'continue']
  if (weakCTAs.some((weak) => primaryCta.label.toLowerCase().includes(weak))) {
    issues.push({
      severity: 'warning',
      section: 'hero',
      message: `Weak CTA copy: "${primaryCta.label}"`,
    })
    suggestions.push('Use action-oriented CTA like "Start Free Trial" or "Get Started Free"')
  }
}

// ================================================================
// FEATURES VALIDATION
// ================================================================

function validateFeatures(
  section: { type: 'features'; data: any },
  issues: QualityIssue[],
  suggestions: string[]
) {
  const { items } = section.data

  if (items.length < 3) {
    issues.push({
      severity: 'warning',
      section: 'features',
      message: 'Too few features (recommended: 3-6)',
    })
  }

  if (items.length > 6) {
    issues.push({
      severity: 'suggestion',
      section: 'features',
      message: 'Too many features may overwhelm users',
    })
    suggestions.push('Consider focusing on 3-6 key features')
  }

  items.forEach((item: any, index: number) => {
    // Feature title too long
    if (item.title.length > 50) {
      issues.push({
        severity: 'suggestion',
        section: 'features',
        message: `Feature ${index + 1} title too long`,
      })
    }

    // Feature description too short
    if (item.body.length < 30) {
      issues.push({
        severity: 'suggestion',
        section: 'features',
        message: `Feature ${index + 1} description too brief`,
      })
    }

    // Check for feature-led vs benefit-led
    if (/\b(includes|has|with|featuring)\b/i.test(item.title)) {
      suggestions.push(`Feature ${index + 1}: Focus on outcome rather than capability`)
    }
  })
}

// ================================================================
// PRICING VALIDATION
// ================================================================

function validatePricing(
  section: { type: 'pricing'; data: any },
  issues: QualityIssue[],
  suggestions: string[]
) {
  const { plans } = section.data

  // Check for highlighted plan
  const hasHighlight = plans.some((plan: any) => plan.highlight)
  if (!hasHighlight && plans.length > 1) {
    issues.push({
      severity: 'warning',
      section: 'pricing',
      message: 'No plan highlighted (recommended to highlight most popular option)',
    })
  }

  plans.forEach((plan: any, index: number) => {
    // Too few features
    if (plan.features.length < 3) {
      issues.push({
        severity: 'warning',
        section: 'pricing',
        message: `Plan ${index + 1} has too few features listed`,
      })
    }

    // Vague pricing
    if (plan.price.toLowerCase().includes('contact') && !plan.highlight) {
      suggestions.push(`Plan ${index + 1}: "Contact us" pricing reduces conversion`)
    }
  })
}

// ================================================================
// FAQ VALIDATION
// ================================================================

function validateFAQ(
  section: { type: 'faq'; data: any },
  issues: QualityIssue[],
  suggestions: string[]
) {
  const { items } = section.data

  if (items.length < 4) {
    issues.push({
      severity: 'suggestion',
      section: 'faq',
      message: 'Consider adding more FAQ items (recommended: 4-8)',
    })
  }

  items.forEach((item: any, index: number) => {
    // Answer too short
    if (item.answer.length < 50) {
      issues.push({
        severity: 'suggestion',
        section: 'faq',
        message: `FAQ ${index + 1} answer too brief`,
      })
    }

    // Question doesn't end with ?
    if (!item.question.endsWith('?')) {
      issues.push({
        severity: 'suggestion',
        section: 'faq',
        message: `FAQ ${index + 1} question should end with "?"`,
      })
    }
  })

  // Check for common objections
  const commonTopics = ['pricing', 'cancel', 'refund', 'support', 'security', 'data']
  const coveredTopics = items.filter((item: any) =>
    commonTopics.some((topic) => item.question.toLowerCase().includes(topic))
  )

  if (coveredTopics.length < 2) {
    suggestions.push('Address common objections: pricing, cancellation, support, security')
  }
}

// ================================================================
// SOCIAL PROOF VALIDATION
// ================================================================

function validateSocialProof(
  section: { type: 'social-proof'; data: any },
  issues: QualityIssue[],
  suggestions: string[]
) {
  const { logos, testimonial } = section.data

  if (logos.length === 0 && !testimonial) {
    issues.push({
      severity: 'critical',
      section: 'social-proof',
      message: 'No social proof provided (logos or testimonials)',
    })
  }

  if (logos.length > 0 && logos.length < 3) {
    issues.push({
      severity: 'suggestion',
      section: 'social-proof',
      message: 'Too few logos (recommended: 5-8)',
    })
  }

  if (testimonial) {
    if (testimonial.quote.length < 50) {
      issues.push({
        severity: 'suggestion',
        section: 'social-proof',
        message: 'Testimonial quote too short',
      })
    }

    if (!testimonial.role) {
      suggestions.push('Include role/company for testimonial credibility')
    }
  }
}

// ================================================================
// SCORING
// ================================================================

function calculateScore(issues: QualityIssue[]): number {
  let score = 100

  issues.forEach((issue) => {
    switch (issue.severity) {
      case 'critical':
        score -= 20
        break
      case 'warning':
        score -= 10
        break
      case 'suggestion':
        score -= 5
        break
    }
  })

  return Math.max(0, Math.min(100, score))
}

function getGrade(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= 90) return 'excellent'
  if (score >= 75) return 'good'
  if (score >= 60) return 'fair'
  return 'poor'
}
