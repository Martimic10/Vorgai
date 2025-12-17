import type { CTASection } from '@/lib/landing-page/types'

interface CTARendererProps {
  section: CTASection
}

export function CTARenderer({ section }: CTARendererProps) {
  return (
    <section className="bg-blue-600 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {section.data.headline}
          </h2>
          {section.data.subheadline && (
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              {section.data.subheadline}
            </p>
          )}
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href={section.data.cta.href}
              className="rounded-md bg-white px-6 py-3 text-base font-semibold text-blue-600 shadow-sm hover:bg-blue-50 transition-all"
            >
              {section.data.cta.label}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
