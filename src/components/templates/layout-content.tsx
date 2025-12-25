"use client"

import { useUser } from '@/src/hooks/use-user'
import { Navbar } from '@/src/components/layout/navbar'
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
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 p-6">
        {children}
      </main>
      <Toaster />
    </div>
  )
}
