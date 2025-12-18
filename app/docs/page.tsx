'use client'

import Link from 'next/link'
import { Navbar } from '@/components/navbar'

export default function DocsPage() {
  return (
    <div className="overflow-y-auto h-screen scrollbar-hide">
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <Navbar />
      <main className="relative z-10 min-h-screen py-24 pt-32">
        <div className="w-full max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">Documentation</h1>

          <div className="space-y-12 text-foreground-secondary mb-32">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Getting Started</h2>
              <p>
                Welcome to Vorg! This guide will help you get started with generating beautiful
                landing pages using AI. Whether you're a developer, designer, or business owner,
                Vorg makes it easy to create professional landing pages in minutes.
              </p>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 mt-4">
                <h3 className="text-lg font-semibold text-foreground mb-3">Quick Start</h3>
                <ol className="space-y-2 list-decimal list-inside">
                  <li>Sign up for a free account (includes 3 free generations)</li>
                  <li>Click "Create Project" from your dashboard</li>
                  <li>Describe your landing page in the chat interface</li>
                  <li>Preview your page in real-time (desktop, tablet, or mobile)</li>
                  <li>Export your code or save for later edits</li>
                </ol>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">How It Works</h2>
              <p>
                Vorg uses advanced AI to understand your requirements and generate pixel-perfect
                landing pages. Our AI considers modern design principles, responsive layouts, and
                conversion optimization best practices.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-foreground mb-2">1. Describe Your Vision</h3>
                  <p className="text-sm">Tell the AI what you want using natural language. Include details about your business, target audience, and desired sections.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-foreground mb-2">2. AI Generation</h3>
                  <p className="text-sm">Our AI processes your request and generates clean, production-ready HTML and CSS tailored to your specifications.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-foreground mb-2">3. Live Preview</h3>
                  <p className="text-sm">View your landing page in real-time across different device sizes. Make adjustments by chatting with the AI.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-foreground mb-2">4. Export & Deploy</h3>
                  <p className="text-sm">Download your code in various formats (HTML, React, Next.js) or export as images for mockups and presentations.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Writing Effective Prompts</h2>
              <p>
                The quality of your generated landing page depends on how well you describe your needs.
                Here are some tips for writing effective prompts:
              </p>
              <div className="space-y-4 mt-4">
                <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Be Specific</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-red-400 font-semibold">✗</span>
                      <span className="text-sm">"Create a landing page for my business"</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 font-semibold">✓</span>
                      <span className="text-sm">"Create a landing page for a SaaS project management tool targeting small teams. Include a hero section with a demo video, features section highlighting collaboration tools, pricing table with 3 tiers, and testimonials from tech companies."</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Include Key Elements</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2"><span className="text-blue-400">•</span><strong>Business Type:</strong> SaaS, e-commerce, agency, portfolio, etc.</li>
                    <li className="flex items-start gap-2"><span className="text-blue-400">•</span><strong>Target Audience:</strong> Developers, small businesses, enterprises, consumers</li>
                    <li className="flex items-start gap-2"><span className="text-blue-400">•</span><strong>Desired Sections:</strong> Hero, features, pricing, testimonials, FAQ, contact</li>
                    <li className="flex items-start gap-2"><span className="text-blue-400">•</span><strong>Style Preferences:</strong> Modern, minimal, bold, professional, playful</li>
                    <li className="flex items-start gap-2"><span className="text-blue-400">•</span><strong>Color Scheme:</strong> Blue and white, dark theme, brand colors</li>
                    <li className="flex items-start gap-2"><span className="text-blue-400">•</span><strong>Call-to-Action:</strong> "Start Free Trial", "Get Demo", "Contact Sales"</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Features & Capabilities</h2>
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                  <h3 className="text-base font-semibold text-foreground mb-2">Responsive Design</h3>
                  <p className="text-sm">All generated pages are fully responsive and look great on desktop, tablet, and mobile devices.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                  <h3 className="text-base font-semibold text-foreground mb-2">Live Editing</h3>
                  <p className="text-sm">Make changes by chatting with the AI. Request modifications and see updates in real-time.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                  <h3 className="text-base font-semibold text-foreground mb-2">Multiple Exports</h3>
                  <p className="text-sm">Export as single-file HTML, HTML+CSS ZIP, React components, or Next.js pages (Pro/Agency plans).</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                  <h3 className="text-base font-semibold text-foreground mb-2">Image Exports</h3>
                  <p className="text-sm">Generate image mockups of your landing page for presentations and client previews (Pro/Agency plans).</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                  <h3 className="text-base font-semibold text-foreground mb-2">Save & Reopen</h3>
                  <p className="text-sm">Save your projects and return later to make edits or generate variations (Starter plan and above).</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                  <h3 className="text-base font-semibold text-foreground mb-2">Clean Code</h3>
                  <p className="text-sm">Production-ready code with semantic HTML, modern CSS, and best practices built-in.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Pricing Plans</h2>
              <p>
                Choose a plan that fits your needs. All paid plans remove the Vorg watermark and include priority support.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-6">
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">Starter</h3>
                  <p className="text-3xl font-bold text-foreground mb-4">$9<span className="text-base font-normal text-foreground-secondary">/mo</span></p>
                  <ul className="space-y-2 text-sm mb-4">
                    <li className="flex items-start gap-2"><span className="text-green-400">✓</span>10 projects/month</li>
                    <li className="flex items-start gap-2"><span className="text-green-400">✓</span>Save & reopen projects</li>
                    <li className="flex items-start gap-2"><span className="text-green-400">✓</span>Single file HTML export</li>
                    <li className="flex items-start gap-2"><span className="text-green-400">✓</span>Remove Vorg badge</li>
                  </ul>
                  <p className="text-xs">Perfect for individuals and small projects</p>
                </div>
                <div className="bg-blue-600/10 border-2 border-blue-500/50 rounded-lg p-6">
                  <div className="inline-block bg-blue-600 text-white text-xs px-3 py-1 rounded-full mb-2">MOST POPULAR</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Pro</h3>
                  <p className="text-3xl font-bold text-foreground mb-4">$19<span className="text-base font-normal text-foreground-secondary">/mo</span></p>
                  <ul className="space-y-2 text-sm mb-4">
                    <li className="flex items-start gap-2"><span className="text-green-400">✓</span>20 projects/month</li>
                    <li className="flex items-start gap-2"><span className="text-green-400">✓</span>HTML + CSS exports (ZIP)</li>
                    <li className="flex items-start gap-2"><span className="text-green-400">✓</span>React & Next.js export</li>
                    <li className="flex items-start gap-2"><span className="text-green-400">✓</span>Image exports (desktop+mobile)</li>
                    <li className="flex items-start gap-2"><span className="text-green-400">✓</span>Faster generation</li>
                    <li className="flex items-start gap-2"><span className="text-green-400">✓</span>Remove Vorg badge</li>
                  </ul>
                  <p className="text-xs">Ideal for freelancers and growing teams</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">Agency</h3>
                  <p className="text-3xl font-bold text-foreground mb-4">$39<span className="text-base font-normal text-foreground-secondary">/mo</span></p>
                  <ul className="space-y-2 text-sm mb-4">
                    <li className="flex items-start gap-2"><span className="text-green-400">✓</span>Unlimited projects</li>
                    <li className="flex items-start gap-2"><span className="text-green-400">✓</span>Premium generation model</li>
                    <li className="flex items-start gap-2"><span className="text-green-400">✓</span>Client handoff exports</li>
                    <li className="flex items-start gap-2"><span className="text-green-400">✓</span>Fastest build speed</li>
                    <li className="flex items-start gap-2"><span className="text-green-400">✓</span>Everything in Pro</li>
                  </ul>
                  <p className="text-xs">For agencies and high-volume users</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Export Options</h2>
              <p>
                Vorg offers multiple export formats to fit your workflow. Choose the format that works best for your project.
              </p>
              <div className="space-y-3 mt-4">
                <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-semibold text-foreground">Single File HTML</h3>
                    <span className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded">Starter+</span>
                  </div>
                  <p className="text-sm">All code in one file. Perfect for quick deployments and simple hosting.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-semibold text-foreground">HTML + CSS (ZIP)</h3>
                    <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded">Pro+</span>
                  </div>
                  <p className="text-sm">Structured project with separate HTML and CSS files. Easier to maintain and customize.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-semibold text-foreground">React Components</h3>
                    <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded">Pro+</span>
                  </div>
                  <p className="text-sm">Modern React components ready to drop into your existing React application.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-semibold text-foreground">Next.js Pages</h3>
                    <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded">Pro+</span>
                  </div>
                  <p className="text-sm">Next.js compatible pages with server-side rendering support.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-semibold text-foreground">Image Exports</h3>
                    <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded">Pro+</span>
                  </div>
                  <p className="text-sm">High-quality PNG images in desktop and mobile sizes for presentations and mockups.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Frequently Asked Questions</h2>
              <div className="space-y-3 mt-4">
                <details className="bg-white/5 border border-white/10 rounded-lg p-5 group">
                  <summary className="text-base font-semibold text-foreground cursor-pointer list-none flex items-center justify-between">
                    Can I edit the generated code?
                    <span className="text-foreground-secondary group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-sm mt-3">Yes! All exported code is clean, readable, and fully editable. You own the code and can modify it however you like.</p>
                </details>
                <details className="bg-white/5 border border-white/10 rounded-lg p-5 group">
                  <summary className="text-base font-semibold text-foreground cursor-pointer list-none flex items-center justify-between">
                    How many revisions can I make?
                    <span className="text-foreground-secondary group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-sm mt-3">Unlimited! Each new AI generation counts as one project, but you can make as many edits and revisions as you want to existing projects for free.</p>
                </details>
                <details className="bg-white/5 border border-white/10 rounded-lg p-5 group">
                  <summary className="text-base font-semibold text-foreground cursor-pointer list-none flex items-center justify-between">
                    Can I use Vorg for client work?
                    <span className="text-foreground-secondary group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-sm mt-3">Absolutely! All paid plans remove the Vorg watermark, and you can use the generated landing pages for client projects. The Agency plan includes client handoff exports for easy delivery.</p>
                </details>
                <details className="bg-white/5 border border-white/10 rounded-lg p-5 group">
                  <summary className="text-base font-semibold text-foreground cursor-pointer list-none flex items-center justify-between">
                    What happens if I run out of projects?
                    <span className="text-foreground-secondary group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-sm mt-3">Project counts reset monthly. You can upgrade to a higher plan anytime for more projects, or wait until next month when your count resets.</p>
                </details>
                <details className="bg-white/5 border border-white/10 rounded-lg p-5 group">
                  <summary className="text-base font-semibold text-foreground cursor-pointer list-none flex items-center justify-between">
                    Do I need coding knowledge?
                    <span className="text-foreground-secondary group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-sm mt-3">No! Vorg is designed for everyone. You can generate and preview landing pages without any coding knowledge. However, if you want to customize the exported code, basic HTML/CSS knowledge is helpful.</p>
                </details>
                <details className="bg-white/5 border border-white/10 rounded-lg p-5 group">
                  <summary className="text-base font-semibold text-foreground cursor-pointer list-none flex items-center justify-between">
                    Can I cancel anytime?
                    <span className="text-foreground-secondary group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-sm mt-3">Yes, cancellation is instant and you'll retain access to your plan features until the end of your billing period.</p>
                </details>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Need Help?</h2>
              <p>
                If you have questions or need assistance, we're here to help!
              </p>
              <div className="flex gap-4 mt-4">
                <Link
                  href="/contact"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  Contact Support
                </Link>
                <Link
                  href="/pricing"
                  className="px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/10 text-foreground rounded-lg transition-colors font-medium"
                >
                  View Pricing
                </Link>
              </div>
            </section>
          </div>

          {/* Footer */}
          <footer className="py-6">
            <div className="flex items-center justify-between">
              {/* Left side - Legal links */}
              <div className="flex items-center gap-3">
                <a
                  href="/privacy"
                  className="px-4 py-2 text-sm bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-color))] rounded-lg hover:bg-[hsl(var(--bg-tertiary))] hover:border-[hsl(var(--border-hover))] transition-all text-[hsl(var(--text-secondary))]"
                >
                  Privacy Policy
                </a>
                <a
                  href="/terms"
                  className="px-4 py-2 text-sm bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-color))] rounded-lg hover:bg-[hsl(var(--bg-tertiary))] hover:border-[hsl(var(--border-hover))] transition-all text-[hsl(var(--text-secondary))]"
                >
                  Terms
                </a>
              </div>

              {/* Right side - Social links */}
              <div className="flex items-center gap-3">
                <a
                  href="https://www.linkedin.com/in/michael-martinez-3a5b44256/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-color))] rounded-lg hover:bg-[hsl(var(--bg-tertiary))] hover:border-[hsl(var(--border-hover))] transition-all text-[hsl(var(--text-secondary))] flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
                <a
                  href="https://x.com/VORGAI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-color))] rounded-lg hover:bg-[hsl(var(--bg-tertiary))] hover:border-[hsl(var(--border-hover))] transition-all text-[hsl(var(--text-secondary))] flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Twitter
                </a>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  )
}
