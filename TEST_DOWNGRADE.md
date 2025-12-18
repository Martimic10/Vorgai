# How to Test Downgrade from Starter to Free Plan

## Option 1: Using Stripe Test Dashboard (Recommended)

Since you're using Stripe test mode, you can cancel your test subscription directly:

1. **Go to Stripe Test Dashboard**
   - Visit: https://dashboard.stripe.com/test/subscriptions
   - Make sure you're in **Test Mode** (toggle in top right)

2. **Find Your Subscription**
   - Look for your test subscription (it should show "Starter" plan)
   - Click on it to open details

3. **Cancel the Subscription**
   - Click "Actions" → "Cancel subscription"
   - Choose "Cancel immediately" (not at period end)
   - Confirm cancellation

4. **Verify Webhook Fires**
   - The `customer.subscription.deleted` webhook should fire
   - Your app will automatically downgrade you to Free plan
   - Check your terminal logs for: `✅ User downgraded to free plan`

5. **Check Your Dashboard**
   - Refresh your Vorg dashboard
   - You should see "Free Plan" in avatar dropdown
   - Generation counter should show "X / 3 projects this month"

---

## Option 2: Using Supabase SQL (Manual Downgrade)

If you want to instantly test without Stripe:

1. **Go to Supabase SQL Editor**
   - Visit: https://app.supabase.com
   - Select your project → SQL Editor

2. **Run This SQL**
   ```sql
   -- Replace YOUR_USER_ID with your actual user ID
   -- You can find it in Supabase Auth > Users

   UPDATE subscriptions
   SET
     plan = 'free',
     status = NULL,
     stripe_subscription_id = NULL,
     generation_limit = 3,
     updated_at = NOW()
   WHERE user_id = 'YOUR_USER_ID';
   ```

3. **Refresh Your Dashboard**
   - You should now see Free plan
   - Counter: "X / 3 projects this month"

---

## Option 3: Quick Test Script (Node.js)

Create a file `test-downgrade.js`:

```javascript
// test-downgrade.js
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testDowngrade() {
  // Get your user ID first
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.log('❌ Not logged in')
    return
  }

  console.log('🔄 Downgrading user:', user.email)

  // Simulate webhook downgrade
  const { error } = await supabase
    .from('subscriptions')
    .update({
      plan: 'free',
      status: null,
      stripe_subscription_id: null,
      generation_limit: 3,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id)

  if (error) {
    console.error('❌ Error:', error)
  } else {
    console.log('✅ Downgraded to Free plan!')
    console.log('Refresh your dashboard to see changes')
  }
}

testDowngrade()
```

Run it:
```bash
node test-downgrade.js
```

---

## What Happens When You Downgrade

### Immediately:
- ✅ Plan changes from "Starter" → "Free"
- ✅ Generation limit: 10 → 3 projects/month
- ✅ Stripe subscription ID removed
- ✅ Status set to `null` (no active subscription)

### You Keep:
- ✅ Your account and all data
- ✅ All existing projects (saved forever)
- ✅ Current month's generation counter (keeps going until reset)

### You Lose:
- ❌ Badge removal (Vorg badge comes back on new projects)
- ❌ Extra generation limit (back to 3/month)
- ❌ Priority support

### Monthly Reset:
- After 30 days, your counter resets to 0
- You get 3 fresh generations
- Cycle repeats monthly

---

## Testing Upgrade Again

After downgrading, test upgrading back:

1. Click any paid plan button
2. Use test card: `4242 4242 4242 4242`
3. Should upgrade instantly (no duplicate subscription)
4. Webhook updates plan and limits

---

## Important Notes

- 🔐 You're in **Stripe Test Mode** - all safe to test
- 🔄 Webhooks work automatically (localhost needs Stripe CLI)
- 💾 No data is lost when downgrading
- ♾️ Free plan is permanent - no expiration

## My Recommendation

Use **Option 1** (Stripe Dashboard) because:
- Tests the real webhook flow
- Most realistic simulation
- Verifies webhook is working correctly
- You can see logs in terminal

Try it now! 🚀
