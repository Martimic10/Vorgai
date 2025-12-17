import { createClient } from '@/lib/supabase/client'
import { PLAN_LIMITS } from '@/lib/stripe'

export type SubscriptionPlan = 'free' | 'starter' | 'pro' | 'agency'

export interface UserSubscription {
  plan: SubscriptionPlan
  status: string
  generationsUsed: number
  generationsLimit: number
  canGenerate: boolean
}

export async function getUserSubscription(): Promise<UserSubscription | null> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  // Get user subscription from database
  const { data: subscription, error: dbError } = await supabase
    .from('subscriptions')
    .select('plan, status, generations_used')
    .eq('user_id', user.id)
    .single()

  if (dbError || !subscription) {
    // Return default free plan if subscription not found
    return {
      plan: 'free',
      status: 'active',
      generationsUsed: 0,
      generationsLimit: PLAN_LIMITS.free.generations,
      canGenerate: true,
    }
  }

  const plan = (subscription.plan || 'free') as SubscriptionPlan
  const generationsUsed = subscription.generations_used || 0
  const generationsLimit = PLAN_LIMITS[plan].generations

  // Unlimited generations for agency plan
  const canGenerate = generationsLimit === -1 || generationsUsed < generationsLimit

  return {
    plan,
    status: subscription.status || 'active',
    generationsUsed,
    generationsLimit,
    canGenerate,
  }
}

export async function incrementGenerationCount(): Promise<boolean> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return false
  }

  // Get current subscription
  const { data: subscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('generations_used, plan')
    .eq('user_id', user.id)
    .single()

  if (fetchError) {
    return false
  }

  const currentCount = subscription?.generations_used || 0
  const plan = (subscription?.plan || 'free') as SubscriptionPlan
  const limit = PLAN_LIMITS[plan].generations

  // Check if user has reached limit (skip check for unlimited agency plan)
  if (limit !== -1 && currentCount >= limit) {
    return false
  }

  // Increment count
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      generations_used: currentCount + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  return !updateError
}

export async function canUserGenerate(): Promise<boolean> {
  const subscription = await getUserSubscription()
  return subscription?.canGenerate || false
}
