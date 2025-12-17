'use client'

import { useState, useEffect } from 'react'
import { X, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { getUserSubscription, type UserSubscription } from '@/lib/subscription'

interface BillingModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
}

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

export function BillingModal({ isOpen, onClose, user }: BillingModalProps) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [loadingPortal, setLoadingPortal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      loadSubscription()
    }
  }, [isOpen])

  const loadSubscription = async () => {
    const data = await getUserSubscription()
    setSubscription(data)
  }

  const handleSubscribe = async (planKey: string, planName: string) => {
    try {
      setLoadingPlan(planName)

      // Get current path to redirect back after payment
      const returnUrl = window.location.pathname + window.location.search

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planKey, returnUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(`Error: ${data.error || 'Failed to create checkout session'}`)
        setLoadingPlan(null)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      console.error('Checkout error:', error)
      alert(`Failed to start checkout: ${error.message}`)
      setLoadingPlan(null)
    }
  }

  const handleManageBilling = async () => {
    try {
      setLoadingPortal(true)

      const response = await fetch('/api/create-customer-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          returnUrl: window.location.pathname + window.location.search
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to open billing portal'
        console.error('Billing portal error:', errorMessage)
        alert(`Error: ${errorMessage}`)
        setLoadingPortal(false)
        return
      }

      // Redirect to Stripe Customer Portal
      if (data.url) {
        window.location.href = data.url
      } else {
        setLoadingPortal(false)
        throw new Error('No portal URL returned')
      }
    } catch (error: any) {
      console.error('Error opening billing portal:', error)
      alert(`Failed to open billing portal: ${error.message}`)
      setLoadingPortal(false)
    }
  }

  if (!isOpen) return null

  const currentPlan = subscription?.plan || 'free'
  const planDisplayName = currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-white">Billing & Plans</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Currently on: <span className="text-white font-medium">{planDisplayName} Plan</span>
              {subscription && (
                <span className="ml-2 text-xs">
                  ({subscription.generationsUsed} / {subscription.generationsLimit === -1 ? '∞' : subscription.generationsLimit} projects)
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] scrollbar-hide">
          <style jsx>{`
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          <div className="px-4 sm:px-6 py-6 sm:py-8">
            {/* Subtitle */}
            <div className="text-center mb-6 sm:mb-8">
              <p className="text-gray-300 text-sm sm:text-base">
                Pick a plan and start generating landing pages instantly.
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-xl border p-6 transition-all duration-300 ${
                    plan.popular
                      ? 'border-white/30 bg-white/5 shadow-[0_0_30px_rgba(255,255,255,0.1)]'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-gray-300">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      <span className="text-gray-400 text-base">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-white" />
                        <span className="text-sm text-gray-300 leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSubscribe(plan.planKey, plan.name)}
                    disabled={loadingPlan === plan.name || currentPlan === plan.planKey}
                    className={`w-full h-10 rounded-lg font-medium transition-all text-sm ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                        : 'bg-white/10 text-white hover:bg-white/15 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed'
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

            {/* Manage Billing for Paid Plans */}
            {currentPlan !== 'free' && subscription && (
              <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-white mb-1">
                      Manage Your Subscription
                    </p>
                    <p className="text-xs text-gray-400">
                      Cancel, downgrade, or update your payment method. Your access continues until the end of the billing period.
                    </p>
                  </div>
                  <Button
                    onClick={handleManageBilling}
                    disabled={loadingPortal}
                    className="w-full sm:w-auto bg-white/10 text-white hover:bg-white/15 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed h-10 px-6 rounded-lg font-medium transition-all text-sm"
                  >
                    {loadingPortal ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      'Manage Billing'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Current Plan Info */}
            {currentPlan === 'free' && subscription && (
              <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white mb-3">
                    Current Plan: Free Plan
                    <span className="ml-2 text-xs text-gray-400">
                      ({subscription.generationsUsed} / {subscription.generationsLimit} projects used)
                    </span>
                  </p>
                  <ul className="space-y-2 mb-3">
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                      <span className="text-xs text-gray-400 leading-relaxed">
                        AI landing page preview
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                      <span className="text-xs text-gray-400 leading-relaxed">
                        Live in-browser preview
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                      <span className="text-xs text-gray-400 leading-relaxed">
                        3 landing page generations
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                      <span className="text-xs text-gray-400 leading-relaxed">
                        Vorg watermark
                      </span>
                    </li>
                  </ul>
                  {!subscription.canGenerate && (
                    <p className="text-xs text-orange-400 font-medium mb-2">
                      ⚠️ You've used all your free projects. Upgrade to continue generating!
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    Upgrade to unlock more features and higher project limits
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
