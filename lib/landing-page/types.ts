// ================================================================
// STRICT LANDING PAGE TYPE DEFINITIONS
// ================================================================

export type Page = {
  meta: {
    title: string
    description: string
    faviconUrl?: string | null
  }

  brand: {
    name: string
    primaryColor: string
    theme: "modern-saas" | "friendly-startup" | "enterprise-dark"
    fontFamily: "Inter"
    tone: "confident-clear" | "friendly" | "serious"
  }

  layout: {
    archetype: "saas" | "mobile-app" | "creator"
    sections: Section[]
  }
}

export type Section =
  | HeroSection
  | SocialProofSection
  | FeaturesSection
  | PricingSection
  | FAQSection
  | CTASection
  | FooterSection

// ================================================================
// HERO SECTION
// ================================================================

export type HeroSection = {
  type: "hero"
  variant: "left-image" | "centered"
  id: string
  constraints: {
    maxHeadlineChars: number
    maxSubheadlineChars: number
    requireCTA: true
  }
  data: {
    eyebrow?: string
    headline: string
    subheadline: string
    primaryCta: {
      label: string
      href: string
    }
    secondaryCta?: {
      label: string
      href: string
    }
    supportingBulletPoints?: string[]
    image?: {
      style: "dashboard-screenshot" | "abstract-ui"
      alt: string
      url?: string | null
    }
    badge?: {
      label: string
      tone: "success" | "info"
    }
  }
}

// ================================================================
// SOCIAL PROOF SECTION
// ================================================================

export type SocialProofSection = {
  type: "social-proof"
  variant: "logo-row"
  id: string
  data: {
    logos: string[]
    testimonial?: {
      quote: string
      author: string
      role?: string
    }
  }
}

// ================================================================
// FEATURES SECTION
// ================================================================

export type FeaturesSection = {
  type: "features"
  variant: "3-col-cards"
  id: string
  data: {
    sectionTitle: string
    sectionSubtitle?: string
    items: {
      icon: string
      title: string
      body: string
    }[]
  }
}

// ================================================================
// PRICING SECTION
// ================================================================

export type PricingSection = {
  type: "pricing"
  variant: "2-tier" | "3-tier"
  id: string
  data: {
    headline: string
    subheadline?: string
    plans: {
      name: string
      price: string
      priceNote?: string
      highlight?: boolean
      description?: string
      features: string[]
      ctaLabel: string
      ctaHref: string
    }[]
  }
}

// ================================================================
// FAQ SECTION
// ================================================================

export type FAQSection = {
  type: "faq"
  variant: "2-col" | "accordion"
  id: string
  data: {
    headline: string
    items: {
      question: string
      answer: string
    }[]
  }
}

// ================================================================
// CTA SECTION
// ================================================================

export type CTASection = {
  type: "cta"
  variant: "centered"
  id: string
  data: {
    headline: string
    subheadline?: string
    cta: {
      label: string
      href: string
    }
  }
}

// ================================================================
// FOOTER SECTION
// ================================================================

export type FooterSection = {
  type: "footer"
  variant: "simple"
  id: string
  data: {
    copyright: string
    links: {
      label: string
      href: string
    }[]
  }
}
