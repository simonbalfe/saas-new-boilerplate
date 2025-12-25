"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/src/hooks/use-user"
import { useRouter } from "next/navigation"
import { checkSubscription } from "@/src/actions/check-subscription"
import { useCheckout } from "@/src/components/hooks/use-checkout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Zap, Check } from "lucide-react"

export function DashboardPage() {
    const { user, loading } = useUser()
    const router = useRouter()
    const { handleCheckout, isLoading: isCheckoutLoading } = useCheckout(user?.id)
    const [subscription, setSubscription] = useState<{ isSubscribed: boolean; tier: string } | null>(null)

    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth")
        }
    }, [user, loading, router])

    useEffect(() => {
        if (user) {
            checkSubscription().then(setSubscription)
        }
    }, [user])

    if (loading || !user) {
        return null
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Welcome back, {user.name?.split(' ')[0] || 'there'}!</h1>
                    <p className="text-muted-foreground">Here&apos;s an overview of your account.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Plan</CardTitle>
                            <CardDescription>Current subscription status</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Badge variant={subscription?.tier === 'Pro' ? 'default' : 'secondary'} className="text-sm">
                                    {subscription?.tier || 'Free'}
                                </Badge>
                                {subscription?.isSubscribed && (
                                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Check className="h-4 w-4 text-green-500" />
                                        Active
                                    </span>
                                )}
                            </div>
                            {!subscription?.isSubscribed && (
                                <Button onClick={handleCheckout} disabled={isCheckoutLoading} className="w-full gap-2">
                                    <Zap className="h-4 w-4" />
                                    {isCheckoutLoading ? "Loading..." : "Upgrade to Pro"}
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Account Info</CardTitle>
                            <CardDescription>Your account details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-medium">{user.name}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Get Started</CardTitle>
                        <CardDescription>This is your SaaS boilerplate dashboard. Build your product here!</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            This boilerplate includes authentication, payments with Stripe, and all the 
                            infrastructure you need to build your SaaS product. Start by customizing 
                            this dashboard to fit your needs.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

