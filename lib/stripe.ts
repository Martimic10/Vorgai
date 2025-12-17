import Stripe from 'stripe'

// Only initialize Stripe if the secret key is available
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    })
  : null

// Price IDs for each plan (you'll need to create these in your Stripe dashboard)
export const STRIPE_PRICE_IDS = {
  starter: process.env.STRIPE_STARTER_PRICE_ID || '',
  pro: process.env.STRIPE_PRO_PRICE_ID || '',
  agency: process.env.STRIPE_AGENCY_PRICE_ID || '',
}

// Plan limits - matching Vorg pricing
export const PLAN_LIMITS = {
  free: {
    generations: 3, // 3 one-time freebies (not per month)
    name: 'Free',
  },
  starter: {
    generations: 10, // 10 projects/month - $9/month
    name: 'Starter',
  },
  pro: {
    generations: 20, // 20 projects/month - $19/month
    name: 'Pro',
  },
  agency: {
    generations: -1, // unlimited projects - $39/month
    name: 'Agency',
  },
}
