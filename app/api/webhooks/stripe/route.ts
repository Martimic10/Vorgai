import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  console.log('🔔 Webhook received!')

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!stripe) {
    console.error('❌ Stripe not configured')
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 503 }
    )
  }

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id

        console.log('🎉 Checkout completed!')
        console.log('   Session ID:', session.id)
        console.log('   User ID from metadata:', userId)
        console.log('   Customer:', session.customer)
        console.log('   Subscription:', session.subscription)

        if (!userId) {
          console.log('⚠️  No user ID in metadata - this is a test event, skipping...')
          return NextResponse.json({ received: true, skipped: 'no user_id' })
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )

        // Get the price ID to determine the plan
        const priceId = subscription.items.data[0].price.id
        let plan = 'free'
        let generationLimit = 3

        if (priceId === process.env.STRIPE_STARTER_PRICE_ID) {
          plan = 'starter'
          generationLimit = 10
        } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
          plan = 'pro'
          generationLimit = 20
        } else if (priceId === process.env.STRIPE_AGENCY_PRICE_ID) {
          plan = 'agency'
          generationLimit = 999999
        }

        console.log('💳 Updating subscription to plan:', plan)
        console.log('   Price ID:', priceId)
        console.log('   Generation Limit:', generationLimit)
        console.log('   Stripe Customer ID:', session.customer)
        console.log('   Stripe Subscription ID:', subscription.id)

        // Update user subscription in database
        const { data: upsertData, error } = await supabaseAdmin
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id,
            plan: plan,
            status: subscription.status === 'active' ? 'active' : subscription.status === 'past_due' ? 'past_due' : 'canceled',
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            generation_limit: generationLimit,
            generations_used: 0, // Reset generation count on new subscription
            generation_reset_at: new Date(subscription.current_period_end * 1000).toISOString(), // Reset aligns with billing period
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id'
          })
          .select()

        if (error) {
          console.error('❌ Error updating user subscription:', error)
          console.error('   Error details:', JSON.stringify(error, null, 2))
          throw error
        }

        console.log('✅ Subscription updated successfully!')
        console.log('   Updated data:', JSON.stringify(upsertData, null, 2))
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        // Get the price ID to determine the plan
        const priceId = subscription.items.data[0].price.id
        let plan = 'free'
        let generationLimit = 3

        if (priceId === process.env.STRIPE_STARTER_PRICE_ID) {
          plan = 'starter'
          generationLimit = 10
        } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
          plan = 'pro'
          generationLimit = 20
        } else if (priceId === process.env.STRIPE_AGENCY_PRICE_ID) {
          plan = 'agency'
          generationLimit = 999999
        }

        console.log('🔄 Subscription updated')
        console.log('   Plan:', plan)
        console.log('   Generation Limit:', generationLimit)

        // Update subscription status and limits
        const { error } = await supabaseAdmin
          .from('subscriptions')
          .update({
            plan: plan,
            status: subscription.status === 'active' ? 'active' : subscription.status === 'past_due' ? 'past_due' : 'canceled',
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            generation_limit: generationLimit,
            generation_reset_at: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('❌ Error updating subscription:', error)
          throw error
        }

        console.log('✅ Subscription updated successfully')
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        console.log('🗑️  Subscription deleted/canceled')
        console.log('   Subscription ID:', subscription.id)

        // Downgrade user to free plan when subscription is canceled
        const { error } = await supabaseAdmin
          .from('subscriptions')
          .update({
            plan: 'free',
            status: null,
            stripe_subscription_id: null,
            generation_limit: 3,
            // Keep generations_used and generation_reset_at to maintain monthly cycle
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('❌ Error downgrading to free plan:', error)
          throw error
        }

        console.log('✅ User downgraded to free plan')
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
