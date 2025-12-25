"use client"
import { useUser } from "@/src/hooks/use-user"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Spinner } from "@/src/components/ui/spinner"

export function HomePage() {
    const router = useRouter()
    const { user, loading } = useUser()

    useEffect(() => {
        if (!loading) {
            if (user) {
                router.push("/dashboard")
            } else {
                router.push("/auth")
            }
        }
    }, [user, loading, router])

    return (
        <div className="flex items-center justify-center min-h-screen">
            <Spinner className="h-8 w-8 text-primary" />
        </div>
    )
}

