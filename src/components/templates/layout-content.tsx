"use client"

import { useUser } from '@/src/hooks/use-user'
import { AppSidebar } from '@/src/components/layout/app-sidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/src/components/ui/sidebar'
import { Toaster } from '@/src/components/ui/sonner'
import { usePathname } from 'next/navigation'
import { Spinner } from '@/src/components/ui/spinner'

export const LayoutContent = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const { user, loading } = useUser()

  if (pathname?.startsWith('/auth')) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <Spinner className="h-12 w-12 text-primary" />
      </div>
    )
  }

  if (!user) {
    return <>{children}</>
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-2" />
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}
