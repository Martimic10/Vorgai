# Vorg - AI Landing Page Generator

A modern SaaS application that generates landing pages using AI. Built with Next.js 14, TypeScript, TailwindCSS, Supabase, and OpenAI.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS (Black/White/Grey theme)
- **Authentication & Database:** Supabase
- **AI Generation:** OpenAI API
- **Payments:** Stripe (ready to integrate)
- **UI Components:** Shadcn UI + Radix UI

## Project Structure

```
Vorg/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts          # AI generation API endpoint
│   ├── auth/
│   │   ├── callback/
│   │   │   └── route.ts          # OAuth callback handler
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   ├── signup/
│   │   │   └── page.tsx          # Signup page
│   │   └── signout/
│   │       └── route.ts          # Sign out handler
│   ├── dashboard/
│   │   └── page.tsx              # Protected dashboard
│   ├── generate/
│   │   └── page.tsx              # Protected generation page
│   ├── globals.css               # Global styles with Tailwind
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/
│   └── ui/
│       ├── button.tsx            # Button component
│       ├── input.tsx             # Input component
│       └── label.tsx             # Label component
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server Supabase client
│   │   └── middleware.ts         # Supabase middleware utilities
│   └── utils.ts                  # Utility functions (cn helper)
├── middleware.ts                 # Next.js middleware for auth
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
├── next.config.mjs               # Next.js configuration
├── postcss.config.mjs            # PostCSS configuration
├── package.json                  # Dependencies
└── .env.local.example            # Environment variables template

```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be ready
3. Go to Project Settings → API
4. Copy your project URL and anon/public key

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Fill in your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Stripe (optional for now)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

### 4. Set Up Supabase Authentication

In your Supabase project dashboard:

1. Go to Authentication → URL Configuration
2. Add your site URL:
   - Site URL: `http://localhost:3000` (for development)
   - Redirect URLs: `http://localhost:3000/auth/callback`
3. Enable Email provider in Authentication → Providers
4. (Optional) Configure email templates in Authentication → Email Templates

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

### Implemented

- ✅ Landing page with hero section
- ✅ User authentication (signup/login)
- ✅ Protected routes (dashboard, generate)
- ✅ AI-powered landing page generation
- ✅ Responsive design with black/white/grey theme
- ✅ Session management with Supabase
- ✅ Middleware for auth protection

### Coming Soon

- ⏳ Project management (save/edit generated pages)
- ⏳ Stripe subscription integration
- ⏳ Multiple AI model support (Claude, GPT-4)
- ⏳ Export generated code
- ⏳ Live preview of generated pages
- ⏳ User settings and profile management

## Theme Configuration

The app uses a dark theme with these colors:

- **Backgrounds:** `#000000`, `#111111`, `#1a1a1a`
- **Text:** `#FFFFFF`, `#EDEDED`
- **Borders:** `#2a2a2a`, `#3a3a3a`

Colors are configured in [tailwind.config.ts](tailwind.config.ts).

## API Routes

- `POST /api/generate` - Generate landing page code from description (protected)

## Protected Pages

These routes require authentication:
- `/dashboard` - User dashboard
- `/generate` - AI generation interface

Unauthenticated users are redirected to `/auth/login`.

## Development Notes

- The app uses Next.js 14 App Router with Server Components
- Authentication state is managed by Supabase with automatic session refresh
- Middleware handles auth token refresh on every request
- Client components are used only where interactivity is needed

## Deployment

For production deployment:

1. Update Supabase URL Configuration with your production URL
2. Set environment variables in your hosting platform
3. Deploy to Vercel, Netlify, or your preferred platform

```bash
npm run build
npm run start
```

## License

MIT
