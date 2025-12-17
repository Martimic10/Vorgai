import type { Page } from './types'

// ================================================================
// PAGE SKELETON GENERATION WITH DYNAMIC THEMING
// ================================================================

export function createPageSkeleton(
  archetype: "saas" | "mobile-app" | "creator",
  industryHint?: string
): Page {
  const skeletons = {
    saas: createSaaSSkeleton(industryHint),
    "mobile-app": createMobileAppSkeleton(industryHint),
    creator: createCreatorSkeleton(industryHint),
  }

  return skeletons[archetype]
}

// ================================================================
// DYNAMIC COLOR PALETTE SELECTION
// ================================================================

function selectColorPalette(industryHint?: string): { primary: string; theme: "modern-saas" | "friendly-startup" | "enterprise-dark" } {
  const lowerHint = (industryHint || '').toLowerCase()

  // Industry-specific color palettes
  if (lowerHint.includes('fitness') || lowerHint.includes('health') || lowerHint.includes('gym')) {
    return { primary: '#EF4444', theme: 'friendly-startup' } // Red/Orange
  }
  if (lowerHint.includes('finance') || lowerHint.includes('banking') || lowerHint.includes('crypto')) {
    return { primary: '#10B981', theme: 'enterprise-dark' } // Green
  }
  if (lowerHint.includes('creative') || lowerHint.includes('design') || lowerHint.includes('art')) {
    return { primary: '#F59E0B', theme: 'friendly-startup' } // Amber
  }
  if (lowerHint.includes('education') || lowerHint.includes('learning') || lowerHint.includes('course')) {
    return { primary: '#8B5CF6', theme: 'modern-saas' } // Purple
  }
  if (lowerHint.includes('music') || lowerHint.includes('audio') || lowerHint.includes('podcast')) {
    return { primary: '#EC4899', theme: 'friendly-startup' } // Pink
  }
  if (lowerHint.includes('gaming') || lowerHint.includes('esport')) {
    return { primary: '#7C3AED', theme: 'enterprise-dark' } // Deep Purple
  }
  if (lowerHint.includes('food') || lowerHint.includes('restaurant') || lowerHint.includes('delivery')) {
    return { primary: '#F97316', theme: 'friendly-startup' } // Orange
  }
  if (lowerHint.includes('travel') || lowerHint.includes('booking') || lowerHint.includes('hotel')) {
    return { primary: '#06B6D4', theme: 'modern-saas' } // Cyan
  }
  if (lowerHint.includes('real estate') || lowerHint.includes('property')) {
    return { primary: '#0EA5E9', theme: 'modern-saas' } // Sky Blue
  }
  if (lowerHint.includes('social') || lowerHint.includes('community') || lowerHint.includes('network')) {
    return { primary: '#8B5CF6', theme: 'friendly-startup' } // Purple
  }
  if (lowerHint.includes('enterprise') || lowerHint.includes('b2b') || lowerHint.includes('corporate')) {
    return { primary: '#1E40AF', theme: 'enterprise-dark' } // Dark Blue
  }
  if (lowerHint.includes('productivity') || lowerHint.includes('tool') || lowerHint.includes('workflow')) {
    return { primary: '#6366F1', theme: 'modern-saas' } // Indigo
  }
  if (lowerHint.includes('ecommerce') || lowerHint.includes('shop') || lowerHint.includes('store')) {
    return { primary: '#059669', theme: 'modern-saas' } // Emerald
  }

  // Default random selection from diverse palette
  const palettes = [
    { primary: '#3B82F6', theme: 'modern-saas' as const }, // Blue
    { primary: '#10B981', theme: 'modern-saas' as const }, // Emerald
    { primary: '#8B5CF6', theme: 'friendly-startup' as const }, // Purple
    { primary: '#EC4899', theme: 'friendly-startup' as const }, // Pink
    { primary: '#F59E0B', theme: 'friendly-startup' as const }, // Amber
    { primary: '#EF4444', theme: 'modern-saas' as const }, // Red
    { primary: '#06B6D4', theme: 'modern-saas' as const }, // Cyan
    { primary: '#6366F1', theme: 'enterprise-dark' as const }, // Indigo
  ]

  // Use industry hint to seed random selection for consistency
  const seed = industryHint ? industryHint.length : Date.now()
  return palettes[seed % palettes.length]
}

// ================================================================
// SAAS ARCHETYPE
// ================================================================

function createSaaSSkeleton(industryHint?: string): Page {
  const { primary, theme } = selectColorPalette(industryHint)

  return {
    meta: {
      title: "",
      description: "",
      faviconUrl: null,
    },
    brand: {
      name: "",
      primaryColor: primary,
      theme: theme,
      fontFamily: "Inter",
      tone: "confident-clear",
    },
    layout: {
      archetype: "saas",
      sections: [
        {
          type: "hero",
          variant: "left-image",
          id: "hero-1",
          constraints: {
            maxHeadlineChars: 60,
            maxSubheadlineChars: 150,
            requireCTA: true,
          },
          data: {
            headline: "",
            subheadline: "",
            primaryCta: {
              label: "",
              href: "#signup",
            },
            secondaryCta: {
              label: "",
              href: "#demo",
            },
          },
        },
        {
          type: "social-proof",
          variant: "logo-row",
          id: "social-proof-1",
          data: {
            logos: [],
          },
        },
        {
          type: "features",
          variant: "3-col-cards",
          id: "features-1",
          data: {
            sectionTitle: "",
            items: [
              { icon: "", title: "", body: "" },
              { icon: "", title: "", body: "" },
              { icon: "", title: "", body: "" },
              { icon: "", title: "", body: "" },
              { icon: "", title: "", body: "" },
              { icon: "", title: "", body: "" },
            ],
          },
        },
        {
          type: "pricing",
          variant: "3-tier",
          id: "pricing-1",
          data: {
            headline: "",
            plans: [
              {
                name: "",
                price: "",
                features: [],
                ctaLabel: "",
                ctaHref: "#signup",
              },
              {
                name: "",
                price: "",
                highlight: true,
                features: [],
                ctaLabel: "",
                ctaHref: "#signup",
              },
              {
                name: "",
                price: "",
                features: [],
                ctaLabel: "",
                ctaHref: "#contact",
              },
            ],
          },
        },
        {
          type: "faq",
          variant: "accordion",
          id: "faq-1",
          data: {
            headline: "",
            items: [
              { question: "", answer: "" },
              { question: "", answer: "" },
              { question: "", answer: "" },
              { question: "", answer: "" },
              { question: "", answer: "" },
            ],
          },
        },
        {
          type: "cta",
          variant: "centered",
          id: "cta-1",
          data: {
            headline: "",
            subheadline: "",
            cta: {
              label: "",
              href: "#signup",
            },
          },
        },
        {
          type: "footer",
          variant: "simple",
          id: "footer-1",
          data: {
            copyright: "",
            links: [
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
              { label: "Contact", href: "/contact" },
            ],
          },
        },
      ],
    },
  }
}

// ================================================================
// MOBILE APP ARCHETYPE
// ================================================================

function createMobileAppSkeleton(industryHint?: string): Page {
  const { primary, theme } = selectColorPalette(industryHint)

  return {
    meta: {
      title: "",
      description: "",
      faviconUrl: null,
    },
    brand: {
      name: "",
      primaryColor: primary,
      theme: theme,
      fontFamily: "Inter",
      tone: "friendly",
    },
    layout: {
      archetype: "mobile-app",
      sections: [
        {
          type: "hero",
          variant: "centered",
          id: "hero-1",
          constraints: {
            maxHeadlineChars: 60,
            maxSubheadlineChars: 150,
            requireCTA: true,
          },
          data: {
            headline: "",
            subheadline: "",
            primaryCta: {
              label: "",
              href: "#download",
            },
          },
        },
        {
          type: "features",
          variant: "3-col-cards",
          id: "features-1",
          data: {
            sectionTitle: "",
            items: [
              { icon: "", title: "", body: "" },
              { icon: "", title: "", body: "" },
              { icon: "", title: "", body: "" },
              { icon: "", title: "", body: "" },
              { icon: "", title: "", body: "" },
              { icon: "", title: "", body: "" },
            ],
          },
        },
        {
          type: "social-proof",
          variant: "logo-row",
          id: "social-proof-1",
          data: {
            logos: [],
          },
        },
        {
          type: "pricing",
          variant: "2-tier",
          id: "pricing-1",
          data: {
            headline: "",
            plans: [
              {
                name: "",
                price: "",
                features: [],
                ctaLabel: "",
                ctaHref: "#download",
              },
              {
                name: "",
                price: "",
                highlight: true,
                features: [],
                ctaLabel: "",
                ctaHref: "#download",
              },
            ],
          },
        },
        {
          type: "faq",
          variant: "2-col",
          id: "faq-1",
          data: {
            headline: "",
            items: [
              { question: "", answer: "" },
              { question: "", answer: "" },
              { question: "", answer: "" },
              { question: "", answer: "" },
              { question: "", answer: "" },
            ],
          },
        },
        {
          type: "cta",
          variant: "centered",
          id: "cta-1",
          data: {
            headline: "",
            cta: {
              label: "",
              href: "#download",
            },
          },
        },
        {
          type: "footer",
          variant: "simple",
          id: "footer-1",
          data: {
            copyright: "",
            links: [
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
              { label: "Support", href: "/support" },
            ],
          },
        },
      ],
    },
  }
}

// ================================================================
// CREATOR ARCHETYPE
// ================================================================

function createCreatorSkeleton(industryHint?: string): Page {
  const { primary, theme } = selectColorPalette(industryHint)

  return {
    meta: {
      title: "",
      description: "",
      faviconUrl: null,
    },
    brand: {
      name: "",
      primaryColor: primary,
      theme: theme,
      fontFamily: "Inter",
      tone: "friendly",
    },
    layout: {
      archetype: "creator",
      sections: [
        {
          type: "hero",
          variant: "centered",
          id: "hero-1",
          constraints: {
            maxHeadlineChars: 60,
            maxSubheadlineChars: 150,
            requireCTA: true,
          },
          data: {
            headline: "",
            subheadline: "",
            primaryCta: {
              label: "",
              href: "#join",
            },
          },
        },
        {
          type: "features",
          variant: "3-col-cards",
          id: "features-1",
          data: {
            sectionTitle: "",
            items: [
              { icon: "", title: "", body: "" },
              { icon: "", title: "", body: "" },
              { icon: "", title: "", body: "" },
              { icon: "", title: "", body: "" },
              { icon: "", title: "", body: "" },
              { icon: "", title: "", body: "" },
            ],
          },
        },
        {
          type: "social-proof",
          variant: "logo-row",
          id: "social-proof-1",
          data: {
            logos: [],
          },
        },
        {
          type: "cta",
          variant: "centered",
          id: "cta-1",
          data: {
            headline: "",
            cta: {
              label: "",
              href: "#join",
            },
          },
        },
        {
          type: "footer",
          variant: "simple",
          id: "footer-1",
          data: {
            copyright: "",
            links: [
              { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },
            ],
          },
        },
      ],
    },
  }
}
