# SaaS Boilerplate

A complete SaaS boilerplate with Next.js, Drizzle ORM, Stripe, and Better Auth.

## Getting Started

Follow these steps to set up your project.

### 1. Buy a Domain (Cloudflare)

1.  Go to [Cloudflare](https://www.cloudflare.com/) or your preferred registrar.
2.  Buy a domain name.
3.  If you use a different registrar, point your nameservers to Cloudflare for better DNS management (optional but recommended).

### 2. Resend (Email)

1.  Go to [Resend](https://resend.com) and sign up.
2.  Add your domain to Resend and verify the DNS records in Cloudflare.
3.  Create an API Key.
4.  Add the following to your `.env` file:
    ```env
    RESEND_API_KEY=re_123...
    RESEND_FROM=onboarding@yourdomain.com
    ```

### 3. Upstash (Redis)

1.  Go to [Upstash](https://upstash.com/) and create a Redis database.
2.  Copy the `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
3.  Add them to your `.env` file:
    ```env
    UPSTASH_REDIS_REST_URL=https://...
    UPSTASH_REDIS_REST_TOKEN=...
    ```

### 4. Database (Postgres on Hetzner)

You need a PostgreSQL database. You can host this on a Hetzner VPS (using Docker or manual install) or use a managed provider.

1.  Set up a PostgreSQL database.
2.  Get the connection string (`postgres://...`).
3.  Add it to your `.env` file:
    ```env
    DATABASE_URL=postgres://user:password@host:port/db
    ```

### 5. Google Auth

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project.
3.  Go to "APIs & Services" > "Credentials".
4.  Create "OAuth client ID".
5.  Set "Authorized JavaScript origins" to `http://localhost:3000` (and your production URL).
6.  Set "Authorized redirect URIs" to `http://localhost:3000/api/auth/callback/google` (and production equivalent).
7.  Copy the Client ID and Client Secret.
8.  Add them to your `.env` file:
    ```env
    GOOGLE_CLIENT_ID=...
    GOOGLE_CLIENT_SECRET=...
    ```

### 6. Stripe (Payments)

1.  Go to [Stripe](https://stripe.com/) and create an account.
2.  Get your API keys (Secret Key and Publishable Key) from the Developer Dashboard.
3.  Create a Product and Price in Stripe. Copy the Price ID (e.g., `price_...`).
4.  Set up a Webhook pointing to `http://localhost:3000/api/webhooks/stripe` (use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`).
5.  Get the Webhook Signing Secret (`whsec_...`).
6.  Add them to your `.env` file:
    ```env
    STRIPE_SECRET_KEY=sk_test_...
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
    STRIPE_WEBHOOK_SECRET=whsec_...
    NEXT_PUBLIC_STRIPE_PRICE_ID=price_...
    ```

### 7. Environment Variables

Create a `.env` file in the root directory and fill in all the values:

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=

# Auth (Google)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Payments (Stripe)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PRICE_ID=

# Email (Resend)
RESEND_API_KEY=
RESEND_FROM=

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Analytics (PostHog - Optional)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### 8. Run the Project

1.  Install dependencies:
    ```bash
    pnpm install
    ```
2.  Push the database schema:
    ```bash
    pnpm db:push
    ```
3.  Run the development server:
    ```bash
    pnpm dev
    ```

## Deployment (Hetzner)

To deploy on a Hetzner VPS using Docker:

1.  Provision a VPS (e.g., Ubuntu).
2.  Install Docker and Docker Compose.
3.  Clone this repository to the server.
4.  Create your `.env` file with production values.
5.  Build and run the container:
    ```bash
    docker build -t saas-app .
    docker run -p 3000:3000 --env-file .env saas-app
    ```
    *Note: For a production setup, consider using Coolify or a reverse proxy (Nginx/Traefik) with SSL.*
