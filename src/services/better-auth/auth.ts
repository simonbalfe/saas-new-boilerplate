import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/src/services/db";
import { nextCookies } from "better-auth/next-js";
import { jwt } from "better-auth/plugins";
import { schema } from "@/src/services/db/schema";
import env from "@/src/env";
import { resend } from "@/src/services/resend/resend-client";
import PasswordResetEmail from "@/src/services/better-auth/password-reset";
import EmailVerification from "@/src/services/better-auth/email-verification";
import { sendWelcomeEmail } from "@/src/actions/welcome-email/send-welcome-email";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema
    }),
    baseURL: env.NEXT_PUBLIC_APP_URL,
    trustedOrigins: [env.NEXT_PUBLIC_APP_URL],
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: true,
        
        sendResetPassword: async ({ user, url }) => {
            const fromEmail = env.RESEND_FROM;
            if (!fromEmail) {
                console.error('RESEND_FROM email not configured');
                return;
            }
            try {
                await resend.emails.send({
                    from: fromEmail,
                    to: user.email,
                    subject: 'Reset your password',
                    react: PasswordResetEmail({
                        name: user.name,
                        resetUrl: url
                    })
                });
            } catch (error) {
                console.error('Error sending password reset email:', error);
                throw error;
            }
        },
        onPasswordReset: async ({ user }) => {
            console.log(`Password reset successful for user: ${user.email}`);
        },
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            const fromEmail = env.RESEND_FROM;

            if (!fromEmail) {
                console.error('RESEND_FROM email not configured');
                return;
            }

            try {
                await resend.emails.send({
                    from: fromEmail,
                    to: user.email,
                    subject: 'Verify your email address',
                    react: EmailVerification({
                        name: user.name,
                        verificationUrl: url
                    })
                });
            } catch (error) {
                console.error('Error sending verification email:', error);
                throw error;
            }
        },
        sendOnSignUp: true,
    },
    socialProviders: {
        google: {
            prompt: "select_account consent",
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
    },
    plugins: [
        nextCookies(), 
        jwt()
    ],
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    try {
                        if (user.emailVerified) {
                            const result = await sendWelcomeEmail({
                                email: user.email,
                                name: user.name,
                                userId: user.id,
                            });

                            if (result.success) {
                                console.log(`Welcome email sent to: ${user.email}`);
                            } else {
                                console.error(`Failed to send welcome email to ${user.email}:`, result.error);
                            }
                        } else {
                            console.log(`Skipping welcome email for unverified user: ${user.email}`);
                        }
                    } catch (error) {
                        console.error('Error in user creation hook:', error);
                    }
                }
            },
            update: {
                after: async (user) => {
                    try {
                        if (user.emailVerified) {
                            const result = await sendWelcomeEmail({
                                email: user.email,
                                name: user.name,
                                userId: user.id,
                            });
                            if (result.success) {
                                console.log(`Welcome email sent after verification to: ${user.email}`);
                            } else {
                                console.error(`Failed to send welcome email to ${user.email}:`, result.error);
                            }
                        }
                    } catch (error) {
                        console.error('Error in user update hook:', error);
                    }
                }
            }
        }
    }
});
