'use server'
import { resend } from '@/src/services/resend/resend-client';
import WelcomeEmail from '@/src/actions/welcome-email/welcome';
import { db } from '@/src/services/db';
import { user } from '@/src/services/db/schema';
import { eq } from 'drizzle-orm';
import env from '../../env';
import { auth } from '@/src/services/better-auth/auth';
import { headers } from 'next/headers';

type EmailData = {
    email: string;
    name: string;
    userId: string;
}

export async function sendWelcomeEmail(emailData: EmailData) {
    const { email, name, userId } = emailData;

    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || session.user.id !== userId) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const [userData] = await db.select()
            .from(user)
            .where(eq(user.id, userId))
            .limit(1);

        if (!userData) {
            return { success: false, error: 'User not found' };
        }

        const fromEmail = env.RESEND_FROM

        if (!fromEmail) {
            return { success: false, error: 'Email not configured' };
        }

        const data = await resend.emails.send({
            from: fromEmail,
            to: email,
            subject: 'Welcome to Our Platform',
            react: WelcomeEmail({ name })
        });

        return { success: true, data };
    } catch (error) {
        console.error('Error sending email:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        };
    }
}
