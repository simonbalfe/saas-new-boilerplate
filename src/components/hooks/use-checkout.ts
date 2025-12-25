'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { createCheckoutSession } from '@/src/actions/checkout-session'
import { authClient } from '@/src/services/better-auth/auth-client'
import env from '@/src/env'

const stripePromise = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export const useCheckout = (userId: string | undefined, priceId?: string | null) => {
    const [isLoading, setIsLoading] = useState(false)
    const handleCheckout = async () => {
        if (!userId) {
            alert('User ID is required')
            return
        }
        setIsLoading(true)
        try {
            const session = await authClient.getSession()
            const email = session.data?.user?.email || ''
            const name = session.data?.user?.name || ''

            const result = await createCheckoutSession({
                userId,
                email,
                name,
                line_item: {
                    price: priceId || env.NEXT_PUBLIC_STRIPE_PRICE_ID,
                    quantity: 1
                }
            })

            if (result.sessionId) {
                const stripe = await stripePromise
                if (!stripe) {
                    throw new Error('Stripe failed to initialize')
                }
                const { error } = await stripe.redirectToCheckout({
                    sessionId: result.sessionId
                })
                if (error) {
                    throw new Error(error.message)
                }
            } else {
                throw new Error(result.error || 'Checkout session creation failed')
            }
        } catch (error) {
            console.error('Checkout error:', error)
            alert(error instanceof Error ? error.message : 'An error occurred during checkout')
        } finally {
            setIsLoading(false)
        }
    }
    return { handleCheckout, isLoading }
}