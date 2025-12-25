"use client"

import { useState, useEffect, Suspense } from "react"
import { authClient } from "@/src/services/better-auth/auth-client"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2, Mail, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Button } from "@/src/components/ui/button"
import { Alert, AlertDescription } from "@/src/components/ui/alert"

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam === "INVALID_TOKEN") {
      setError("This password reset link is invalid or has expired")
    }
  }, [searchParams])

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: "/auth/reset-password",
      })

      if (result.error) {
        setError(result.error.message || "Failed to send reset link")
      } else {
        setEmailSent(true)
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!token) {
      setError("Invalid reset token")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setLoading(true)

    try {
      const result = await authClient.resetPassword({
        newPassword,
        token,
      })

      if (result.error) {
        setError(result.error.message || "Failed to reset password")
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push("/auth")
        }, 2000)
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col gap-6 pt-6 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
              <p className="text-muted-foreground">
                We&apos;ve sent a password reset link to <span className="font-medium text-foreground">{email}</span>
              </p>
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              asChild
            >
              <Link href="/auth">
                Return to Sign In
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Password Reset Successful</CardTitle>
            <CardDescription>
              Your password has been updated. Redirecting to login...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              Enter your email address and we&apos;ll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRequestReset} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="space-y-4 mt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending Link...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
                <div className="text-center text-sm">
                  <Button variant="link" asChild className="p-0 h-auto">
                    <Link href="/auth" className="flex items-center gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Back to login
                    </Link>
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create New Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={8}
              />
            </div>
            <div className="space-y-4 mt-6">
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
              <div className="text-center text-sm">
                <Button variant="link" asChild className="p-0 h-auto">
                  <Link href="/auth">
                    Back to login
                  </Link>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export const ResetPassword = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-muted/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
              <CardDescription>Please wait</CardDescription>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
