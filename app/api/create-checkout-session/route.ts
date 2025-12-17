import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { planKey, returnUrl } = await request.json()

    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.' },
        { status: 503 }
      )
    }

    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get price ID from planKey
    const priceId = STRIPE_PRICE_IDS[planKey as keyof typeof STRIPE_PRICE_IDS]

    if (!priceId || !priceId.startsWith('price_')) {
      return NextResponse.json(
        { error: `Invalid plan or missing price ID for plan: ${planKey}. Make sure STRIPE_${planKey.toUpperCase()}_PRICE_ID is set in .env.local` },
        { status: 400 }
      )
    }

    // Determine success URL - redirect back to where user came from
    const successUrl = returnUrl
      ? `${process.env.NEXT_PUBLIC_SITE_URL}${returnUrl}${returnUrl.includes('?') ? '&' : '?'}success=true`
      : `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true`

    // Determine cancel URL - redirect back to where user came from
    const cancelUrl = returnUrl
      ? `${process.env.NEXT_PUBLIC_SITE_URL}${returnUrl}${returnUrl.includes('?') ? '&' : '?'}canceled=true`
      : `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=true`

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      client_reference_id: user.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: user.id,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: `Failed to create checkout session: ${error.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}
