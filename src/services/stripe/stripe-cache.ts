import { redis } from "../redis";
import { STRIPE_SUB_CACHE } from "./types";

export const STRIPE_CACHE_KV = {
    generateKey(stripeCustomerId: string) {
        return `stripe:customer:${stripeCustomerId}:sub-status`;
    },
    async get(stripeCustomerId: string): Promise<STRIPE_SUB_CACHE> {
        const response = await redis.get(this.generateKey(stripeCustomerId));
        if (!response) return { status: "none" };
        return response as STRIPE_SUB_CACHE
    },
    async set(stripeCustomerId: string, status: STRIPE_SUB_CACHE) {
        await redis.set(this.generateKey(stripeCustomerId), JSON.stringify(status));
    }
};

export const STRIPE_CUSTOMER_ID_KV = {
  generateKey(userId: string) {
    return `user:${userId}:stripe-customer-id`;
  },
  async get(userId: string) {
    return await redis.get(this.generateKey(userId));
  },
  async set(userId: string, customerId: string) {
    await redis.set(this.generateKey(userId), customerId);
  }
};
