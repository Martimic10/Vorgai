'use client'

import { useState } from 'react'
import type { FAQSection } from '@/lib/landing-page/types'

interface FAQRendererProps {
  section: FAQSection
}

export function FAQRenderer({ section }: FAQRendererProps) {
  if (section.variant === '2-col') {
    return <FAQ2Col section={section} />
  }
  return <FAQAccordion section={section} />
}

// ================================================================
// ACCORDION VARIANT
// ================================================================

function FAQAccordion({ section }: FAQRendererProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {section.data.headline}
          </h2>
        </div>

        <div className="mt-16 space-y-4">
          {section.data.items.map((item, index) => (
            <div key={index} className="border-b border-gray-200">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-start justify-between py-6 text-left"
              >
                <span className="text-base font-semibold leading-7 text-gray-900">
                  {item.question}
                </span>
                <span className="ml-6 flex h-7 items-center">
                  {openIndex === index ? (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  )}
                </span>
              </button>
              {openIndex === index && (
                <div className="pb-6 pr-12">
                  <p className="text-base leading-7 text-gray-600">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ================================================================
// 2-COLUMN VARIANT
// ================================================================

function FAQ2Col({ section }: FAQRendererProps) {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {section.data.headline}
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
          {section.data.items.map((item, index) => (
            <div key={index}>
              <h3 className="text-base font-semibold leading-7 text-gray-900">
                {item.question}
              </h3>
              <p className="mt-2 text-base leading-7 text-gray-600">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
