"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ResetPasswordForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      const supabase = createClient();

      // Make sure the full absolute URL is used for the redirect
      const origin = window.location.origin;
      const redirectUrl = `${origin}/auth/update-password`;

      console.log("Sending reset with redirectTo:", redirectUrl);

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      setSuccess(true);
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
      setSuccess(false);
    }
  });

  // Handle form submission
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    setError(null);
    resetPasswordMutation.mutate();
  };

  // Handle back to login
  const handleBackToLogin = () => {
    router.push("/auth/login");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset Password</CardTitle>
          <CardDescription>Enter your email to receive a password reset link</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <Alert className="mb-4">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Check your email</AlertTitle>
              <AlertDescription>
                We've sent a password reset link to {email}. Please check your inbox and follow the instructions to reset your password.
                <p className="mt-2 text-sm">
                  The link will redirect you to <strong>{window.location.origin}/auth/update-password</strong>
                </p>
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={resetPasswordMutation.isPending}>
                  {resetPasswordMutation.isPending ? "Sending reset link..." : "Send reset link"}
                </Button>
              </div>
            </form>
          )}
          <div className="mt-6 text-center">
            <Button variant="link" onClick={handleBackToLogin} className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Back to login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
