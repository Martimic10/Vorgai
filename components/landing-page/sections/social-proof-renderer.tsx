import type { SocialProofSection } from '@/lib/landing-page/types'

interface SocialProofRendererProps {
  section: SocialProofSection
}

export function SocialProofRenderer({ section }: SocialProofRendererProps) {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {section.data.testimonial && (
          <div className="mx-auto max-w-2xl text-center mb-12">
            <blockquote className="text-xl font-semibold leading-8 text-gray-900 sm:text-2xl sm:leading-9">
              <p>"{section.data.testimonial.quote}"</p>
            </blockquote>
            <figcaption className="mt-6">
              <div className="font-semibold text-gray-900">{section.data.testimonial.author}</div>
              {section.data.testimonial.role && (
                <div className="mt-1 text-sm text-gray-600">{section.data.testimonial.role}</div>
              )}
            </figcaption>
          </div>
        )}

        {section.data.logos.length > 0 && (
          <div>
            <p className="text-center text-sm font-semibold uppercase tracking-wide text-gray-500 mb-8">
              Trusted by leading companies
            </p>
            <div className="mx-auto grid max-w-lg grid-cols-2 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-3 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
              {section.data.logos.map((logo, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center h-12 text-gray-400 font-bold text-lg"
                >
                  {logo}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
