# SaaS Boilerplate

A modern SaaS boilerplate with authentication and Stripe payments, built with Next.js 16.

## Features

- **Authentication** - Email/password + Google OAuth via Better Auth
  - Email verification
  - Password reset
  - Session management
  
- **Payments** - Stripe subscription management
  - Checkout sessions
  - Webhook handling
  - Subscription status caching (Redis)

- **Database** - PostgreSQL with Drizzle ORM
  - Type-safe queries
  - Schema migrations

- **Email** - Resend integration
  - Welcome emails
  - Password reset emails
  - Email verification

- **Analytics** - PostHog integration

- **UI** - Tailwind CSS + Radix UI components (shadcn/ui)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database (or Neon)
- Stripe account
- Resend account
- Google OAuth credentials (optional)
- Upstash Redis

### Environment Variables

Create a `.env.local` file with:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=your_postgres_connection_string

# Stripe
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_ID=price_...

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Email (Resend)
RESEND_API_KEY=re_...
RESEND_FROM=noreply@yourdomain.com

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Analytics (PostHog)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### Installation

```bash
pnpm install
```

### Database Setup

```bash
pnpm db:generate
pnpm db:migrate
```

### Development

```bash
pnpm dev
```

In a separate terminal, run Stripe webhook forwarding:

```bash
pnpm stripe
```

## Project Structure

```
src/
├── actions/           # Server actions
├── app/               # Next.js App Router pages
│   ├── api/           # API routes
│   ├── auth/          # Auth pages
│   ├── dashboard/     # Main dashboard
│   ├── payment/       # Payment page
│   └── settings/      # User settings
├── components/        # React components
│   ├── layout/        # Layout components
│   ├── pages/         # Page-specific components
│   ├── templates/     # Layout templates
│   └── ui/            # UI primitives (shadcn)
├── hooks/             # Custom React hooks
├── lib/               # Utilities
└── services/          # Backend services
    ├── better-auth/   # Auth configuration
    ├── db/            # Database schema & connection
    ├── redis.ts       # Redis client
    ├── resend/        # Email client
    └── stripe/        # Stripe integration
```

## Customization

1. Update branding in `src/app/layout.tsx`
2. Modify the color scheme in `src/globals.css`
3. Add your business logic to the dashboard page
4. Configure your Stripe products and prices

## Deployment

This boilerplate is configured for Vercel deployment:

```bash
vercel deploy
```

Make sure to:
1. Add all environment variables to Vercel
2. Set up Stripe webhooks pointing to your production URL
3. Configure your domain for email sending in Resend

## License

MIT

