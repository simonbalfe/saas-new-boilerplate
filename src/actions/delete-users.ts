'use server'
import { db } from '@/src/services/db'
import { user } from '@/src/services/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/src/services/better-auth/auth'
import { headers } from 'next/headers'

export async function deleteUser(userId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || session.user.id !== userId) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        await db.delete(user).where(eq(user.id, userId))
        return { success: true }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to delete user' }
    }
}
