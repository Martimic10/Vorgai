'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getUserSubscription, type UserSubscription } from '@/lib/subscription'
import { Zap, Crown, Rocket, AlertCircle } from 'lucide-react'

interface SubscriptionStatusProps {
  onUpgradeClick?: () => void
}

export function SubscriptionStatus({ onUpgradeClick }: SubscriptionStatusProps) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSubscription = async () => {
      const data = await getUserSubscription()
      setSubscription(data)
      setLoading(false)
    }

    loadSubscription()

    // Refresh subscription when user returns from successful payment
    const checkForPaymentSuccess = () => {
      if (window.location.search.includes('success=true')) {
        // Poll for subscription updates every 2 seconds for up to 30 seconds
        let attempts = 0
        const maxAttempts = 15

        const pollSubscription = async () => {
          const data = await getUserSubscription()

          // Check if subscription has updated (not on free plan anymore)
          if (data && data.plan !== 'free') {
            setSubscription(data)
            setLoading(false)
            return
          }

          attempts++
          if (attempts < maxAttempts) {
            setTimeout(pollSubscription, 2000)
          } else {
            // Final refresh after max attempts
            setSubscription(data)
            setLoading(false)
          }
        }

        // Start polling after initial delay
        setTimeout(pollSubscription, 2000)
      }
    }

    checkForPaymentSuccess()

    // Also listen for focus events (when user comes back to tab)
    window.addEventListener('focus', loadSubscription)
    return () => window.removeEventListener('focus', loadSubscription)
  }, [])

  if (loading) {
    return (
      <div className="px-4 py-3 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-color))] rounded-lg">
        <div className="w-32 h-4 bg-gray-700 rounded animate-pulse" />
      </div>
    )
  }

  if (!subscription) return null

  const { plan, generationsUsed, generationsLimit, canGenerate } = subscription

  // Plan icons and colors
  const planConfig = {
    free: { icon: Zap, color: 'text-gray-400', bgColor: 'bg-gray-500/10' },
    starter: { icon: Zap, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
    pro: { icon: Rocket, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
    agency: { icon: Crown, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
  }

  const config = planConfig[plan]
  const Icon = config.icon
  const percentage = generationsLimit === -1 ? 0 : (generationsUsed / generationsLimit) * 100
  const isNearLimit = percentage >= 80 && canGenerate

  return (
    <div className="px-4 py-3 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border-color))] rounded-lg">
      <div className="flex items-center justify-between gap-3">
        {/* Plan Info */}
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${config.bgColor} flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${config.color}`} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[hsl(var(--text-primary))] capitalize">
              {plan === 'free' ? 'Free Plan' : `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`}
            </span>
            <span className="text-xs text-[hsl(var(--text-secondary))]">
              {generationsLimit === -1
                ? `${generationsUsed} projects created`
                : `${generationsUsed} / ${generationsLimit} projects`
              }
            </span>
          </div>
        </div>

        {/* Progress Bar or Upgrade Button */}
        {generationsLimit === -1 ? (
          <span className="text-xs text-[hsl(var(--text-secondary))] px-3 py-1 bg-[hsl(var(--bg-tertiary))] rounded-full">
            Unlimited
          </span>
        ) : canGenerate ? (
          <div className="flex flex-col items-end gap-1">
            <div className="w-24 h-1.5 bg-[hsl(var(--bg-tertiary))] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isNearLimit ? 'bg-orange-500' : 'bg-blue-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            {isNearLimit && (
              <span className="text-xs text-orange-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Low
              </span>
            )}
          </div>
        ) : (
          <button
            onClick={onUpgradeClick}
            className="text-xs font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upgrade
          </button>
        )}
      </div>
    </div>
  )
}
