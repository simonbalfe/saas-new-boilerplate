import Stripe from "stripe";

export type STRIPE_SUB_CACHE =
    | {
        subscriptionId: string | null;
        status: Stripe.Subscription.Status;
        priceId: string | null;
        currentPeriodStart: number | null;
        currentPeriodEnd: number | null;
        cancelAtPeriodEnd: boolean;
        paymentMethod: {
            brand: string | null;
            last4: string | null; 
        } | null;
    }
    | {
        status: "none";
    };