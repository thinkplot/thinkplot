"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function UpdatePasswordForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Check if we're in password recovery mode
  useEffect(() => {
    const checkUrlHash = () => {
      // Check if there's a hash or query parameter that indicates a password recovery
      const hasResetParams = window.location.href.includes("type=recovery") || window.location.hash.includes("type=recovery");

      if (hasResetParams) {
        setIsResetMode(true);
      }
    };

    const checkAuthState = async () => {
      try {
        const supabase = createClient();

        // Check current session state
        const {
          data: { session }
        } = await supabase.auth.getSession();
        if (session) {
          setIsResetMode(true);
        }

        // Listen for auth state changes
        const {
          data: { subscription }
        } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "PASSWORD_RECOVERY") {
            setIsResetMode(true);
          } else if (session) {
            // If we have a session but no specific event, still allow password reset
            setIsResetMode(true);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error("Auth state check error:", err);
        setError("Error checking authentication state");
      } finally {
        setAuthChecked(true);
      }
    };

    checkUrlHash();
    checkAuthState();
  }, []);

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.updateUser({
        password
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
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setError(null);
    updatePasswordMutation.mutate();
  };

  // Handle redirect to login
  const handleGoToLogin = () => {
    router.push("/auth/login");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Update Password</CardTitle>
          <CardDescription>Choose a new password for your account</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="grid gap-6">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>Your password has been updated successfully.</AlertDescription>
              </Alert>
              <Button onClick={handleGoToLogin} className="w-full">
                Go to Login
              </Button>
            </div>
          ) : !isResetMode ? (
            <div className="grid gap-6">
              {authChecked && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Invalid Password Reset Session</AlertTitle>
                  <AlertDescription>
                    It looks like you've either:
                    <ul className="list-disc pl-4 mt-2">
                      <li>Used an expired password reset link</li>
                      <li>Already completed the password reset process</li>
                      <li>Accessed this page directly without a valid reset link</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {!authChecked && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Checking your reset link...</AlertTitle>
                  <AlertDescription>Please wait while we validate your password reset request.</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-2">
                <Button onClick={() => router.push("/auth/reset-password")} className="w-full">
                  Request a new password reset
                </Button>
              </div>

              <div className="text-center">
                <Button variant="link" onClick={handleGoToLogin} className="mt-2">
                  Return to Login
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword}>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="password">New Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={updatePasswordMutation.isPending}>
                  {updatePasswordMutation.isPending ? "Updating password..." : "Update password"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
