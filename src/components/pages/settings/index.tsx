"use client"

import { useEffect } from "react"
import { useUser } from "@/src/hooks/use-user"
import { useRouter } from "next/navigation"
import { authClient } from "@/src/services/better-auth/auth-client"
import { deleteUser } from "@/src/actions/delete-users"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Separator } from "@/src/components/ui/separator"
import { User, LogOut, Trash2 } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog"

export function SettingsPage() {
    const { user, loading } = useUser()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push("/auth")
        }
    }, [user, loading, router])

    const handleSignOut = async () => {
        await authClient.signOut()
        router.push("/auth")
    }

    const handleDeleteAccount = async () => {
        if (!user?.id) return
        await deleteUser(user.id)
        await authClient.signOut()
        router.push("/auth")
    }

    if (loading || !user) {
        return null
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-muted-foreground">Manage your account settings</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>Your account information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
                                <AvatarFallback>
                                    <User className="h-8 w-8" />
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium text-lg">{user.name}</p>
                                <p className="text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Account Actions</CardTitle>
                        <CardDescription>Manage your account</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button variant="outline" onClick={handleSignOut} className="w-full justify-start gap-2">
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </Button>
                        
                        <Separator />
                        
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full justify-start gap-2">
                                    <Trash2 className="h-4 w-4" />
                                    Delete Account
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your 
                                        account and remove all your data from our servers.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteAccount}>
                                        Delete Account
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

