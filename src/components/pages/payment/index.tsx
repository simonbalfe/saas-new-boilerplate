"use client"

import { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/src/hooks/use-user'
import { useCheckout } from '@/src/components/hooks/use-checkout'
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import env from '@/src/env'

const PLANS = {
    pro: env.NEXT_PUBLIC_STRIPE_PRICE_ID
}

function PaymentPageContent() {
    const { user, loading } = useUser()
    const router = useRouter()
    const searchParams = useSearchParams()
    
    const plan = searchParams.get('plan')
    const priceId = plan ? PLANS[plan as keyof typeof PLANS] : null

    const { handleCheckout, isLoading: isCheckoutLoading } = useCheckout(user?.id, priceId)
    const autoRedirectAttempted = useRef(false)
    const [showCard, setShowCard] = useState(false)

    useEffect(() => {
        if (!loading && !user) {
            const callbackUrl = plan ? `/payment?plan=${plan}` : '/payment'
            router.push(`/auth?callbackUrl=${encodeURIComponent(callbackUrl)}`)
        } else if (!loading && user && !autoRedirectAttempted.current) {
             
             autoRedirectAttempted.current = true
             handleCheckout().then(() => {
                 
                 setShowCard(true)
             })
        }
    }, [user, loading, router, handleCheckout, plan])

    if (loading || !user || !showCard) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
            <Card className="w-full max-w-[400px]">
                <CardContent className="flex flex-col gap-6 pt-6 text-center">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight">Complete Subscription</h1>
                        <p className="text-muted-foreground">
                            You are about to upgrade to the Pro plan.
                        </p>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                         <div className="flex justify-between items-center py-2 border-b">
                            <span className="font-medium">Pro Plan</span>
                            <span className="font-bold">$X/mo</span>
                         </div>
                    </div>

                    <Button 
                        onClick={handleCheckout} 
                        disabled={isCheckoutLoading}
                        className="w-full"
                    >
                        {isCheckoutLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Proceed to Payment"
                        )}
                    </Button>
                    <Button 
                        variant="ghost" 
                        onClick={() => router.push('/dashboard')}
                        className="w-full"
                    >
                        Cancel
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

export function PaymentPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <PaymentPageContent />
        </Suspense>
    )
}
