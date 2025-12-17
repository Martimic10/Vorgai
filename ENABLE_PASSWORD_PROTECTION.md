# Enable Leaked Password Protection

The Security Advisor flagged that leaked password protection is currently disabled. Here's how to enable it:

## Steps to Enable

### 1. Go to Supabase Dashboard

Navigate to your project: https://supabase.com/dashboard/project/YOUR_PROJECT_ID

### 2. Go to Authentication Settings

1. Click on **Authentication** in the left sidebar
2. Click on **Providers**
3. Find and click on **Email**

### 3. Enable Password Leak Check

1. Scroll down to find **"Check for leaked passwords"** option
2. **Toggle it ON** (enable it)
3. Click **Save** at the bottom

## What This Does

When enabled, Supabase will check user passwords against the [Have I Been Pwned](https://haveibeenpwned.com/) database to prevent users from using passwords that have been exposed in data breaches.

**Benefits:**
- ✅ Prevents users from using compromised passwords
- ✅ Improves overall account security
- ✅ Protects against credential stuffing attacks
- ✅ Minimal performance impact
- ✅ Privacy-preserving (uses k-anonymity)

## Verification

After enabling, the Security Advisor warning should disappear on the next scan.

You can verify it's working by trying to sign up with a known leaked password (like `password123`).

## Note

This is a Supabase-level configuration, not something that can be set via SQL migrations. That's why you need to enable it through the dashboard.

---

**Status:** ⚠️ Needs manual configuration in Supabase Dashboard
