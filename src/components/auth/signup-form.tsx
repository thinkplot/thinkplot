"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2Icon } from "lucide-react";
import { useState } from "react";
import { Provider } from "@supabase/supabase-js";

const signupSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const [signupSuccess, setSignupSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: ""
    }
  });

  // Signup with email
  const signupMutation = useMutation({
    mutationFn: async (data: SignupFormValues) => {
      const supabase = createClient();

      const response = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            display_name: data.displayName
          }
        }
      });

      if (response.error) {
        throw response.error;
      }

      return response.data;
    },
    onSuccess: () => {
      setSignupSuccess(true);
    }
  });

  // oauth signup
  const oauthSignupMutation = useMutation({
    mutationFn: async (provider: string) => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as Provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        throw error;
      }

      return data;
    }
  });

  // Handle form submission
  const onSubmit = (data: SignupFormValues) => {
    signupMutation.mutate(data);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>Sign up with your email to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button type="button" variant="outline" className="w-full" onClick={() => oauthSignupMutation.mutate("google")} disabled={oauthSignupMutation.isPending}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  {oauthSignupMutation.isPending ? "Connecting..." : "Sign up with Google"}
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={() => oauthSignupMutation.mutate("github")} disabled={oauthSignupMutation.isPending}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4"
                  >
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                  </svg>
                  {oauthSignupMutation.isPending ? "Connecting..." : "Sign up with GitHub"}
                </Button>
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">Or continue with</span>
              </div>
              {signupSuccess ? (
                <Alert>
                  <AlertTitle className="flex items-center gap-2">
                    <CheckCircle2Icon className="h-4 w-4" />
                    Signup successful!
                  </AlertTitle>
                  <AlertDescription>
                    <p>Please check your email for the confirmation link to activate your account.</p>
                    <Button type="button" className="mt-4 w-full" onClick={() => router.push("/auth/login")}>
                      Go to login
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input id="displayName" {...register("displayName")} type="text" placeholder="John Doe" />
                    {errors.displayName && <p className="text-red-500 text-sm">{errors.displayName.message}</p>}
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" {...register("email")} type="email" placeholder="m@example.com" />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" {...register("password")} type="password" />
                    {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                  </div>
                  {signupMutation.error && <div className="text-red-500 text-sm">{(signupMutation.error as Error).message || "An error occurred during signup"}</div>}
                  <Button type="submit" className="w-full" disabled={signupMutation.isPending}>
                    {signupMutation.isPending ? "Creating account..." : "Create account"}
                  </Button>
                </div>
              )}
              <div className="text-center text-sm">
                Already have an account?{" "}
                <a href="/auth/login" className="underline underline-offset-4">
                  Login
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
