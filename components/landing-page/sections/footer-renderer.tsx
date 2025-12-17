import type { FooterSection } from '@/lib/landing-page/types'

interface FooterRendererProps {
  section: FooterSection
}

export function FooterRenderer({ section }: FooterRendererProps) {
  return (
    <footer className="bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-y-4 sm:flex-row">
          <p className="text-sm leading-5 text-gray-400">
            {section.data.copyright}
          </p>
          <nav className="flex gap-x-6">
            {section.data.links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-sm leading-6 text-gray-400 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
