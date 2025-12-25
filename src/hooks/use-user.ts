import { authClient } from '@/src/services/better-auth/auth-client'

export const useUser = () => {
    const session = authClient.useSession()
    return {
        user: session.data?.user || null,
        loading: session.isPending
    }
}
