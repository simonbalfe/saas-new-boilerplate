"use client"

import { useEffect, useState } from 'react'
import { Settings, Zap, Crown, User as UserIcon, LayoutDashboard, Home, PenSquare } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCheckout } from '@/src/components/hooks/use-checkout'
import { checkSubscription } from '@/src/actions/check-subscription'
import { useUser } from '@/src/hooks/use-user'
import { Avatar, AvatarImage, AvatarFallback } from '@/src/components/ui/avatar'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/src/components/ui/sidebar'

const navItems = [
  {
    title: 'Home',
    href: '/',
    icon: Home,
  },
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Create Post',
    href: '/create-post',
    icon: PenSquare,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
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
    <Sidebar>
      <SidebarHeader className="h-14 border-b border-sidebar-border flex-row items-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-semibold truncate">SaaS Boilerplate</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!isSubscribed && (
          <Button
            onClick={handleCheckout}
            disabled={isLoading}
            variant="default"
            className="w-full cursor-pointer gap-2"
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
        
        <SidebarSeparator />
        
        <div className="flex items-center gap-3 px-2 py-1">
          <Avatar className="h-8 w-8 relative shrink-0">
            <AvatarImage src={user?.image || undefined} alt={user?.name || 'User'} />
            <AvatarFallback>
              <UserIcon className="h-4 w-4" />
            </AvatarFallback>
            {isSubscribed && (
              <Crown className="h-3.5 w-3.5 text-primary absolute -top-1 -right-1" />
            )}
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-medium truncate">{user?.name || 'User'}</span>
            <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
          </div>
          {tier && (
            <Badge variant={tier === 'Pro' ? 'default' : 'secondary'} className="shrink-0">
              {tier}
            </Badge>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
