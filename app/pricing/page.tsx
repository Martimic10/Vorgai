'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Check, ChevronDown, Loader2 } from 'lucide-react'
import { StarsBackground } from '@/components/shooting-stars'
import { getUserSubscription } from '@/lib/subscription'

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
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchSubscription = async () => {
      const subscription = await getUserSubscription()
      if (subscription && subscription.plan !== 'free') {
        setCurrentPlan(subscription.plan)
      }
    }
    fetchSubscription()
  }, [])

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const handleSubscribe = async (planKey: string, planName: string) => {
    try {
      setLoadingPlan(planName)

      // Get current path to redirect back after payment
      const returnUrl = window.location.pathname + window.location.search

      // Create checkout session - auth check happens on server
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planKey, returnUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        // If unauthorized, redirect to signup
        if (response.status === 401) {
          router.push('/auth/signup')
          return
        }

        const errorMessage = data.error || 'Failed to create checkout session'
        console.error('Checkout error:', errorMessage)
        alert(`Error: ${errorMessage}`)
        setLoadingPlan(null)
        return
      }

      // Redirect to Stripe checkout immediately
      if (data.url) {
        window.location.href = data.url
      } else {
        setLoadingPlan(null)
        throw new Error('No checkout URL returned')
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error)
      alert(`Failed to start checkout: ${error.message}`)
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
                {plan.popular && !currentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-semibold tracking-wide shadow-lg">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                {currentPlan === plan.planKey && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-green-600 text-white px-4 py-1 rounded-full text-xs font-semibold tracking-wide shadow-lg">
                      CURRENT PLAN
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
                  disabled={loadingPlan === plan.name || currentPlan === plan.planKey}
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
                  ) : currentPlan === plan.planKey ? (
                    'Current Plan'
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
                  href="https://www.linkedin.com/in/michael-martinez-3a5b44256/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-color))] rounded-lg hover:bg-[hsl(var(--bg-tertiary))] hover:border-[hsl(var(--border-hover))] transition-all text-[hsl(var(--text-secondary))] flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
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
