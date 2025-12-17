import type { PricingSection } from '@/lib/landing-page/types'

interface PricingRendererProps {
  section: PricingSection
}

export function PricingRenderer({ section }: PricingRendererProps) {
  return (
    <section className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {section.data.headline}
          </h2>
          {section.data.subheadline && (
            <p className="mt-4 text-lg leading-8 text-gray-600">
              {section.data.subheadline}
            </p>
          )}
        </div>

        <div className={`mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 ${
          section.variant === '3-tier' ? 'lg:max-w-6xl lg:grid-cols-3' : 'lg:max-w-4xl lg:grid-cols-2'
        }`}>
          {section.data.plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-3xl p-8 ring-1 ${
                plan.highlight
                  ? 'bg-blue-600 ring-blue-600 shadow-2xl lg:z-10 lg:scale-105'
                  : 'bg-white ring-gray-200'
              } ${
                section.variant === '3-tier' && index === 1 ? 'sm:rounded-b-none lg:rounded-r-none' : ''
              }`}
            >
              <h3 className={`text-lg font-semibold leading-8 ${
                plan.highlight ? 'text-white' : 'text-gray-900'
              }`}>
                {plan.name}
              </h3>

              {plan.description && (
                <p className={`mt-2 text-sm leading-6 ${
                  plan.highlight ? 'text-blue-100' : 'text-gray-600'
                }`}>
                  {plan.description}
                </p>
              )}

              <p className="mt-6 flex items-baseline gap-x-1">
                <span className={`text-4xl font-bold tracking-tight ${
                  plan.highlight ? 'text-white' : 'text-gray-900'
                }`}>
                  {plan.price}
                </span>
                {plan.priceNote && (
                  <span className={`text-sm font-semibold leading-6 ${
                    plan.highlight ? 'text-blue-100' : 'text-gray-600'
                  }`}>
                    {plan.priceNote}
                  </span>
                )}
              </p>

              <a
                href={plan.ctaHref}
                className={`mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 transition-all ${
                  plan.highlight
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
              >
                {plan.ctaLabel}
              </a>

              <ul className="mt-8 space-y-3 text-sm leading-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex gap-x-3">
                    <svg
                      className={`h-6 w-5 flex-none ${
                        plan.highlight ? 'text-white' : 'text-blue-600'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    <span className={plan.highlight ? 'text-white' : 'text-gray-600'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
