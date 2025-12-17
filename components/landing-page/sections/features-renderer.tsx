import type { FeaturesSection } from '@/lib/landing-page/types'
import { IconRenderer } from '../utils/icon-renderer'

interface FeaturesRendererProps {
  section: FeaturesSection
}

export function FeaturesRenderer({ section }: FeaturesRendererProps) {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {section.data.sectionTitle}
          </h2>
          {section.data.sectionSubtitle && (
            <p className="mt-4 text-lg leading-8 text-gray-600">
              {section.data.sectionSubtitle}
            </p>
          )}
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {section.data.items.map((feature, index) => (
              <div key={index} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                    <IconRenderer icon={feature.icon} className="h-6 w-6 text-white" />
                  </div>
                  {feature.title}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.body}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
