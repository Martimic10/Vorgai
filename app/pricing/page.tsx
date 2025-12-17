'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Check, ChevronDown, Loader2 } from 'lucide-react'
import { StarsBackground } from '@/components/shooting-stars'
import { createClient } from '@/lib/supabase/client'

const plans = [
  {
    name: 'Starter',
    planKey: 'starter',
    price: '$9',
    period: '/mo',
    features: [
      '10 projects/month',
      'Save & reopen projects',
      'Single file HTML export',
      'Remove Vorg badge',
    ],
    cta: 'Get Starter Plan',
    popular: false,
  },
  {
    name: 'Pro',
    planKey: 'pro',
    price: '$19',
    period: '/mo',
    features: [
      '20 projects/month',
      'HTML + CSS exports (ZIP)',
      'React & Next.js export',
      'Image exports (desktop+mobile)',
      'Faster generation',
      'Remove Vorg badge',
    ],
    cta: 'Get Pro Plan',
    popular: true,
  },
  {
    name: 'Agency',
    planKey: 'agency',
    price: '$39',
    period: '/mo',
    features: [
      'Unlimited projects',
      'Premium generation model',
      'Client handoff exports',
      'Fastest build speed',
      'Everything in Pro',
    ],
    cta: 'Get Agency Plan',
    popular: false,
  },
]

const faqs = [
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes, cancellation is instant and access continues until period ends.',
  },
  {
    question: 'Do unused projects roll over?',
    answer: 'Not right now — project counts reset monthly.',
  },
  {
    question: 'Can I change plans later?',
    answer: 'Yes, upgrades or downgrades take effect immediately.',
  },
  {
    question: 'How are projects counted?',
    answer: 'Each *new* AI generation counts as one project. Edits & revisions are free.',
  },
]

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const handleSubscribe = async (planKey: string, planName: string) => {
    try {
      setLoadingPlan(planName)

      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        // Redirect to signup if not authenticated
        router.push('/auth/signup')
        return
      }

      // Get current path to redirect back after payment
      const returnUrl = window.location.pathname + window.location.search

      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planKey, returnUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to create checkout session'
        console.error('Checkout error:', errorMessage)
        alert(`Error: ${errorMessage}`)
        setLoadingPlan(null)
        return
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error)
      alert(`Failed to start checkout: ${error.message}`)
    } finally {
      setLoadingPlan(null)
    }
  }

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

      {/* Background Effects */}
      <div className="fixed inset-0 bg-[hsl(var(--bg-primary))] -z-10">
        <StarsBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--bg-primary))] via-transparent to-[hsl(var(--bg-primary))]" />
      </div>

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="relative z-10 min-h-screen py-24 pt-24 sm:pt-32 px-4 pb-32">
        <div className="w-full max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 sm:mb-20">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 text-[hsl(var(--text-primary))]">Pricing</h1>
            <p className="text-base sm:text-lg text-[hsl(var(--text-secondary))] max-w-2xl mx-auto px-4">
              Pick a plan and start generating landing pages instantly.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-20 sm:mb-32">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-6 sm:p-8 transition-all duration-300 ${
                  plan.popular
                    ? 'border-blue-500/50 bg-blue-500/10 shadow-[0_0_40px_rgba(59,130,246,0.2)] hover:shadow-[0_0_50px_rgba(59,130,246,0.3)] dark:border-white/30 dark:bg-white/5 dark:shadow-[0_0_40px_rgba(255,255,255,0.15)] dark:hover:shadow-[0_0_50px_rgba(255,255,255,0.2)]'
                    : 'border-[hsl(var(--border-color))] bg-[hsl(var(--bg-secondary))] hover:border-[hsl(var(--border-hover))] hover:bg-[hsl(var(--bg-tertiary))] shadow-md'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-semibold tracking-wide shadow-lg">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-[hsl(var(--text-secondary))]">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-[hsl(var(--text-primary))]">{plan.price}</span>
                    <span className="text-[hsl(var(--text-secondary))] text-lg">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600 dark:text-white" />
                      <span className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan.planKey, plan.name)}
                  disabled={loadingPlan === plan.name}
                  className={`w-full h-11 rounded-lg font-medium transition-all ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed'
                      : 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-quaternary))] border border-[hsl(var(--border-color))] dark:bg-white/10 dark:text-white dark:hover:bg-white/15 dark:border-white/10 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {loadingPlan === plan.name ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    plan.cta
                  )}
                </Button>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto mb-32">
            <h2 className="text-3xl font-bold text-center mb-12 text-[hsl(var(--text-primary))]">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-[hsl(var(--border-color))] rounded-xl bg-[hsl(var(--bg-secondary))] overflow-hidden transition-all hover:border-[hsl(var(--border-hover))] shadow-sm"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left transition-all text-[hsl(var(--text-primary))]"
                  >
                    <span className="font-medium pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openFaq === index ? 'max-h-48' : 'max-h-0'
                    }`}
                  >
                    <div className="px-6 pb-5 text-[hsl(var(--text-secondary))] leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-color))] rounded-lg hover:bg-[hsl(var(--bg-tertiary))] hover:border-[hsl(var(--border-hover))] transition-all text-[hsl(var(--text-secondary))] flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  GitHub
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
