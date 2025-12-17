import type { HeroSection } from '@/lib/landing-page/types'
import { IconRenderer } from '../utils/icon-renderer'

interface HeroRendererProps {
  section: HeroSection
}

export function HeroRenderer({ section }: HeroRendererProps) {
  if (section.variant === 'centered') {
    return <HeroCentered section={section} />
  }
  return <HeroLeftImage section={section} />
}

// ================================================================
// LEFT IMAGE VARIANT
// ================================================================

function HeroLeftImage({ section }: HeroRendererProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center">
          {/* Content */}
          <div className="lg:pr-8">
            {section.data.badge && (
              <div className="mb-4">
                <span className={`inline-flex items-center rounded-full px-4 py-1 text-sm font-medium ${
                  section.data.badge.tone === 'success'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {section.data.badge.label}
                </span>
              </div>
            )}

            {section.data.eyebrow && (
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 mb-4">
                {section.data.eyebrow}
              </p>
            )}

            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              {section.data.headline}
            </h1>

            <p className="mt-6 text-lg leading-8 text-gray-600">
              {section.data.subheadline}
            </p>

            {section.data.supportingBulletPoints && section.data.supportingBulletPoints.length > 0 && (
              <ul className="mt-6 space-y-2">
                {section.data.supportingBulletPoints.map((point, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700">
                    <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {point}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-10 flex items-center gap-x-6">
              <a
                href={section.data.primaryCta.href}
                className="rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500 transition-all"
              >
                {section.data.primaryCta.label}
              </a>
              {section.data.secondaryCta && (
                <a
                  href={section.data.secondaryCta.href}
                  className="text-base font-semibold leading-7 text-gray-900 hover:text-blue-600 transition-colors"
                >
                  {section.data.secondaryCta.label} <span aria-hidden="true">→</span>
                </a>
              )}
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            {section.data.image?.url ? (
              <img
                src={section.data.image.url}
                alt={section.data.image.alt}
                className="w-full rounded-xl shadow-2xl ring-1 ring-gray-400/10"
              />
            ) : (
              <div className="aspect-[4/3] w-full rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 shadow-2xl ring-1 ring-gray-400/10 flex items-center justify-center">
                <span className="text-6xl">📱</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// ================================================================
// CENTERED VARIANT
// ================================================================

function HeroCentered({ section }: HeroRendererProps) {
  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {section.data.badge && (
            <div className="mb-6">
              <span className={`inline-flex items-center rounded-full px-4 py-1 text-sm font-medium ${
                section.data.badge.tone === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {section.data.badge.label}
              </span>
            </div>
          )}

          {section.data.eyebrow && (
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 mb-4">
              {section.data.eyebrow}
            </p>
          )}

          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            {section.data.headline}
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            {section.data.subheadline}
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href={section.data.primaryCta.href}
              className="rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500 transition-all"
            >
              {section.data.primaryCta.label}
            </a>
            {section.data.secondaryCta && (
              <a
                href={section.data.secondaryCta.href}
                className="text-base font-semibold leading-7 text-gray-900 hover:text-blue-600 transition-colors"
              >
                {section.data.secondaryCta.label} <span aria-hidden="true">→</span>
              </a>
            )}
          </div>

          {section.data.image?.url && (
            <div className="mt-16">
              <img
                src={section.data.image.url}
                alt={section.data.image.alt}
                className="mx-auto w-full max-w-3xl rounded-xl shadow-2xl ring-1 ring-gray-400/10"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
