import Stripe from "stripe";
import { stripe, allowedEvents } from "./stripe-client";
import { STRIPE_CACHE_KV } from "./stripe-cache";
import { STRIPE_SUB_CACHE } from "./types";

export async function processEvent(event: Stripe.Event) {
    if (!allowedEvents.includes(event.type)) return;

    const { customer: customerId } = event?.data?.object as {
        customer: string;
    };

    if (typeof customerId !== "string") {
        throw new Error(
            `[STRIPE HOOK] ID isn't string.\nEvent type: ${event.type}`
        );
    }

    return await syncStripeDataToKV(customerId);
}

export async function syncStripeDataToKV(customerId: string) {

    const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        limit: 1,
        status: "all",
        expand: ["data.default_payment_method"],
    });

    if (subscriptions.data.length === 0) {
        const subData: STRIPE_SUB_CACHE = { status: "none" };
        await STRIPE_CACHE_KV.set(customerId, subData);
        return subData;
    }

    const subscription = subscriptions.data[0];

    const subData = {
        subscriptionId: subscription.id,
        status: subscription.status,
        priceId: subscription.items.data[0].price.id,
        currentPeriodEnd: subscription.items.data[0].current_period_end,
        currentPeriodStart: subscription.items.data[0].current_period_start,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        paymentMethod:
            subscription.default_payment_method &&
                typeof subscription.default_payment_method !== "string"
                ? {
                    brand: subscription.default_payment_method.card?.brand ?? null,
                    last4: subscription.default_payment_method.card?.last4 ?? null,
                }
                : null,
    };
    await STRIPE_CACHE_KV.set(customerId, subData);
    return subData;
}
