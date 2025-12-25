import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/src/services/better-auth/auth'
import { headers } from 'next/headers'

export async function proxy(request: NextRequest) {
    console.log('[proxy middleware] proxy middleware was hit for:', request.nextUrl.pathname)

    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        console.log('[proxy middleware] No session, redirecting to /auth');
        const url = new URL('/auth', request.url);
        url.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search);
        return NextResponse.redirect(url);
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!auth|api|_next/static|_next/image|favicon.ico).*)']
}