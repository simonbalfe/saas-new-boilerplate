import { createAuthClient } from "better-auth/react"
import { jwtClient } from "better-auth/client/plugins"
import env from "@/src/env"

export const authClient = createAuthClient({
    baseURL: env.NEXT_PUBLIC_APP_URL,
    plugins: [
        jwtClient()
    ]
})
