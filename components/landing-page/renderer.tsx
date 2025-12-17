import type { Page, Section } from '@/lib/landing-page/types'
import { HeroRenderer } from './sections/hero-renderer'
import { SocialProofRenderer } from './sections/social-proof-renderer'
import { FeaturesRenderer } from './sections/features-renderer'
import { PricingRenderer } from './sections/pricing-renderer'
import { FAQRenderer } from './sections/faq-renderer'
import { CTARenderer } from './sections/cta-renderer'
import { FooterRenderer } from './sections/footer-renderer'
import { useState } from 'react'

// ================================================================
// VORG BADGE COMPONENT
// ================================================================

function VorgBadge() {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)

  const handleUpgradeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    // Send message to parent window to open billing modal
    if (typeof window !== 'undefined' && window.parent) {
      window.parent.postMessage('openBillingModal', '*')
    }
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999]"
      onMouseEnter={() => setIsTooltipVisible(true)}
      onMouseLeave={() => setIsTooltipVisible(false)}
    >
      {/* Tooltip */}
      <div
        className={`absolute bottom-full right-0 mb-2 bg-white rounded-lg px-3 py-2 shadow-lg whitespace-nowrap transition-all duration-200 ${
          isTooltipVisible ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-1'
        }`}
        style={{ pointerEvents: isTooltipVisible ? 'auto' : 'none' }}
      >
        <p className="text-xs text-gray-600 m-0" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
          Upgrade to{' '}
          <button
            onClick={handleUpgradeClick}
            className="font-semibold text-blue-500 hover:text-blue-700 underline cursor-pointer"
          >
            Starter Plan
          </button>{' '}
          to remove branding.
        </p>
        {/* Arrow */}
        <div className="absolute bottom-[-4px] right-5 w-2 h-2 bg-white transform rotate-45"></div>
      </div>

      {/* Badge */}
      <a
        href="https://vorg.com"
        target="_blank"
        rel="noopener noreferrer"
        className="block no-underline"
      >
        <div className="bg-white rounded-lg px-3 py-2 shadow-lg flex items-center gap-2 cursor-pointer transition-all duration-200 hover:shadow-xl">
          <img src="/Vorg.png" alt="Vorg" className="w-4 h-4 object-contain" />
          <span className="text-xs font-semibold text-gray-800" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
            Made with Vorg
          </span>
        </div>
      </a>
    </div>
  )
}

// ================================================================
// MAIN PAGE RENDERER
// ================================================================

interface PageRendererProps {
  page: Page
}

export function PageRenderer({ page }: PageRendererProps) {
  const themeClass = getThemeClass(page.brand.theme)

  return (
    <div
      className={`min-h-screen ${themeClass}`}
      style={{
        fontFamily: page.brand.fontFamily,
        '--brand-primary': page.brand.primaryColor,
      } as React.CSSProperties}
    >
      {page.layout.sections.map((section, index) => (
        <SectionRenderer key={section.id} section={section} index={index} />
      ))}

      {/* Vorg Badge */}
      <VorgBadge />
    </div>
  )
}

// ================================================================
// SECTION ROUTER
// ================================================================

interface SectionRendererProps {
  section: Section
  index: number
}

function SectionRenderer({ section, index }: SectionRendererProps) {
  switch (section.type) {
    case 'hero':
      return <HeroRenderer section={section} />
    case 'social-proof':
      return <SocialProofRenderer section={section} />
    case 'features':
      return <FeaturesRenderer section={section} />
    case 'pricing':
      return <PricingRenderer section={section} />
    case 'faq':
      return <FAQRenderer section={section} />
    case 'cta':
      return <CTARenderer section={section} />
    case 'footer':
      return <FooterRenderer section={section} />
    default:
      return null
  }
}

// ================================================================
// THEME UTILITIES
// ================================================================

function getThemeClass(theme: string): string {
  const themes = {
    'modern-saas': 'bg-white text-gray-900',
    'friendly-startup': 'bg-gradient-to-b from-purple-50 to-white text-gray-900',
    'enterprise-dark': 'bg-gray-900 text-white',
  }
  return themes[theme as keyof typeof themes] || themes['modern-saas']
}
