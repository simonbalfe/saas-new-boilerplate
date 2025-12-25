"use client"

import { useEffect, useState } from 'react'
import { Settings, Zap, Crown, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import { useCheckout } from '@/src/components/hooks/use-checkout'
import { checkSubscription } from '@/src/actions/check-subscription'
import { useUser } from '@/src/hooks/use-user'
import { Avatar, AvatarImage, AvatarFallback } from '@/src/components/ui/avatar'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'

export const Navbar = () => {
  const { user } = useUser()
  const { handleCheckout, isLoading } = useCheckout(user?.id)
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null)
  const [tier, setTier] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      checkSubscription().then((data) => {
        setIsSubscribed(data.isSubscribed)
        setTier(data.tier)
      })
    }
  }, [user])

  return (
    <nav className="flex items-center justify-between bg-background border-b border-border px-6 h-14 sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-lg font-semibold">SaaS Boilerplate</Link>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          {tier && (
            <Badge variant={tier === 'Pro' ? 'default' : 'secondary'} className="h-6">
              {tier}
            </Badge>
          )}
          {!isSubscribed && (
            <Button
              onClick={handleCheckout}
              disabled={isLoading}
              variant="default"
              className="cursor-pointer gap-2 shadow-md"
            >
              {isLoading ? (
                "Loading..."
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Upgrade
                </>
              )}
            </Button>
          )}
          <Link href="/settings" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <Avatar className="h-8 w-8 relative">
            <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
            <AvatarFallback>
              <UserIcon className="h-4 w-4" />
            </AvatarFallback>
            {isSubscribed && (
              <Crown className="h-3.5 w-3.5 text-primary absolute -top-1 -right-1" />
            )}
          </Avatar>
        </div>
      )}
    </nav>
  )
}
