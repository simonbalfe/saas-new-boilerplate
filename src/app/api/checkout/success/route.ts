import { redirect } from 'next/navigation';
import { STRIPE_CUSTOMER_ID_KV } from '@/src/services/stripe/stripe-cache';
import { syncStripeDataToKV } from '@/src/services/stripe/stripe-sync';
import { auth } from '@/src/services/better-auth/auth';
import { headers } from 'next/headers';

export async function GET() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) {
        return redirect("/auth");
    }
    const stripeCustomerId = await STRIPE_CUSTOMER_ID_KV.get(session.user.id);

    if (!stripeCustomerId) {
        return redirect("/");
    }
    await syncStripeDataToKV(stripeCustomerId as string);
    return redirect("/dashboard");
}