import type { Metadata } from 'next'
import '@/src/globals.css'
import { PostHogProvider } from '@/src/lib/providers'
import { LayoutContent } from '@/src/components/templates/layout-content'

export const metadata: Metadata = {
  title: 'SaaS Boilerplate',
  description: 'A modern SaaS boilerplate with auth and payments',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className='font-primary'>
        <PostHogProvider>
          <LayoutContent>{children}</LayoutContent>
        </PostHogProvider>
      </body>
    </html>
  )
}
